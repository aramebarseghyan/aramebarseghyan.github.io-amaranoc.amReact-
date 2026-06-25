import { useEffect, useRef, useState } from "react";
import { db } from "../../firebase";
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  addDoc,
} from "firebase/firestore";

const servers = {
  iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
};

export default function Call({ mode, callId, caller, callee, onClose }) {
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const offerRef = useRef(null);
  const [status, setStatus] = useState(
    mode === "offer" ? "calling" : "incoming",
  );

  const hangup = async () => {
    try {
      if (callId) {
        const callDocRef = doc(db, "calls", callId);
        await updateDoc(callDocRef, { status: "ended" }).catch(() => {});
      }
    } catch (error) {
      console.error(error);
    }
    try {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      pcRef.current?.close();
    } catch (error) {
      console.error(error);
    }
    onClose && onClose();
  };

  useEffect(() => {
    let callDocRef = null;
    let unsubCall = null;
    let unsubCallerCandidates = null;

    async function start() {
      pcRef.current = new RTCPeerConnection(servers);

      pcRef.current.ontrack = (event) => {
        if (remoteAudioRef.current)
          remoteAudioRef.current.srcObject = event.streams[0];
      };

      // Խնդրում ենք բրաուզերին միացնել միկրոֆոնը
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      localStreamRef.current = localStream;
      localStream
        .getTracks()
        .forEach((track) => pcRef.current.addTrack(track, localStream));

      callDocRef = callId
        ? doc(db, "calls", callId)
        : doc(collection(db, "calls"));

      const callerUid = caller?.uid;
      const calleeUid = callee?.uid;

      const callerCandidatesCollection = collection(
        callDocRef,
        "callerCandidates",
      );
      const calleeCandidatesCollection = collection(
        callDocRef,
        "calleeCandidates",
      );

      pcRef.current.onicecandidate = async (event) => {
        if (event.candidate) {
          const c = event.candidate.toJSON();
          if (mode === "offer") {
            await addDoc(callerCandidatesCollection, c);
          } else {
            await addDoc(calleeCandidatesCollection, c);
          }
        }
      };

      if (mode === "offer") {
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);

        await setDoc(callDocRef, {
          caller: callerUid,
          callee: calleeUid,
          offer: { type: offer.type, sdp: offer.sdp },
          status: "ringing",
        });

        unsubCall = onSnapshot(callDocRef, (snap) => {
          const data = snap.data();
          if (!pcRef.current.currentRemoteDescription && data?.answer) {
            const answerDesc = new RTCSessionDescription(data.answer);
            pcRef.current.setRemoteDescription(answerDesc);
            setStatus("connected");
          }
          if (data?.status === "rejected" || data?.status === "ended") {
            hangup();
          }
        });

        unsubCallerCandidates = onSnapshot(
          collection(callDocRef, "calleeCandidates"),
          (snap) => {
            snap.docChanges().forEach((change) => {
              if (change.type === "added") {
                pcRef.current.addIceCandidate(
                  new RTCIceCandidate(change.doc.data()),
                );
              }
            });
          },
        );
      } else {
        unsubCall = onSnapshot(callDocRef, (snap) => {
          const data = snap.data();
          if (!data) return;
          if (data.offer) {
            offerRef.current = data.offer;
            setStatus("incoming");
          }
          if (data.status === "ended" || data.status === "rejected") {
            hangup();
          }
        });

        unsubCallerCandidates = onSnapshot(
          collection(callDocRef, "callerCandidates"),
          (snap) => {
            snap.docChanges().forEach((change) => {
              if (change.type === "added") {
                pcRef.current.addIceCandidate(
                  new RTCIceCandidate(change.doc.data()),
                );
              }
            });
          },
        );
      }
    }

    start().catch((error) => {
      console.error("Call setup error:", error);
      alert(
        "Միկրոֆոնի հասանելիության սխալ: Ստուգեք բրաուզերի կարգավորումները:",
      );
    });

    return () => {
      try {
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        pcRef.current?.close();
      } catch (error) {
        console.error(error);
      }
      if (unsubCall) unsubCall();
      if (unsubCallerCandidates) unsubCallerCandidates();
    };
  }, []);

  const acceptCall = async () => {
    if (!callId || !offerRef.current || !pcRef.current) return;
    try {
      const callDocRef = doc(db, "calls", callId);
      const offerDesc = new RTCSessionDescription(offerRef.current);
      await pcRef.current.setRemoteDescription(offerDesc);
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      await updateDoc(callDocRef, {
        answer: { type: answer.type, sdp: answer.sdp },
        status: "connected",
      });
      setStatus("connected");
    } catch (error) {
      console.error("Accept error:", error);
    }
  };

  const rejectCall = async () => {
    if (callId) {
      const callDocRef = doc(db, "calls", callId);
      await updateDoc(callDocRef, { status: "rejected" }).catch(() => {});
    }
    hangup();
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:bottom-8 sm:left-auto sm:right-8 z-[100] animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`relative bg-gray-900/90 backdrop-blur-xl border border-white/10 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl flex items-center gap-3 sm:gap-5 w-full sm:w-80 overflow-hidden ${
          status === "calling" || status === "incoming"
            ? "ring-2 ring-orange-500/50 shadow-orange-500/20"
            : "ring-1 ring-white/20"
        }`}
      >
        {/* Անիմացիոն ֆոն զանգի ժամանակ */}
        {(status === "calling" || status === "incoming") && (
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent animate-pulse pointer-events-none" />
        )}

        {/* User Icon */}
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center border border-gray-600 shadow-inner z-10 relative">
            <svg
              className="w-6 h-6 text-gray-300"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          {(status === "calling" || status === "incoming") && (
            <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-20" />
          )}
        </div>

        {/* Text Info */}
        <div className="flex-1 min-w-0 z-10">
          <div className="text-white font-semibold truncate text-xs sm:text-sm">
            {mode === "offer" ? callee?.name : caller?.name || "Անհայտ զանգ"}
          </div>
          <div className="text-xs font-medium flex items-center gap-1 mt-0.5">
            {status === "incoming" && (
              <span className="text-orange-400 animate-pulse">
                Ներգնա զանգ...
              </span>
            )}
            {status === "calling" && (
              <span className="text-blue-400 animate-pulse">Զանգում է...</span>
            )}
            {status === "connected" && (
              <span className="text-green-400">● Զրույցն ընթացքում է</span>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 z-10 flex-shrink-0">
          {status === "incoming" ? (
            <>
              <button
                onClick={acceptCall}
                className="w-9 h-9 sm:w-10 sm:h-10 bg-green-500 hover:bg-green-400 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 flex-shrink-0"
                title="Ընդունել"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
                </svg>
              </button>
              <button
                onClick={rejectCall}
                className="w-9 h-9 sm:w-10 sm:h-10 bg-red-500 hover:bg-red-400 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 flex-shrink-0"
                title="Մերժել"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 10.59L16.59 6 18 7.41 13.41 12 18 16.59 16.59 18 12 13.41 7.41 18 6 16.59 10.59 12 6 7.41 7.41 6 12 10.59z" />
                </svg>
              </button>
            </>
          ) : (
            <button
              onClick={hangup}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-red-500 hover:bg-red-400 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 flex-shrink-0"
              title="Ավարտել զանգը"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.52-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <audio ref={remoteAudioRef} autoPlay className="hidden" />
    </div>
  );
}
