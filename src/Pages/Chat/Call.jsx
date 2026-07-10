import { useEffect, useRef, useState, useCallback } from "react";
import { db } from "../../firebase";
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  addDoc,
  getDoc,
} from "firebase/firestore";

const servers = { iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }] };

export default function Call({ mode, callId, caller, callee, onClose }) {
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const offerRef = useRef(null);
  const [status, setStatus] = useState(
    mode === "offer" ? "calling" : "incoming",
  );

  const hangup = useCallback(async () => {
    try {
      if (callId) {
        const callDocRef = doc(db, "calls", callId);
        const callSnap = await getDoc(callDocRef);
        // Թարմացնում ենք միայն այն դեպքում, եթե փաստաթուղթը բազայում գոյություն ունի
        if (callSnap.exists()) {
          await updateDoc(callDocRef, { status: "ended" });
        }
      }
    } catch (error) {
      console.error("Զանգն ավարտելու սխալ:", error);
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (pcRef.current) {
      pcRef.current.close();
    }
    if (onClose) onClose();
  }, [callId, onClose]);

  const rejectCall = async () => {
    try {
      if (callId) {
        const callDocRef = doc(db, "calls", callId);
        const callSnap = await getDoc(callDocRef);
        if (callSnap.exists()) {
          await updateDoc(callDocRef, { status: "rejected" });
        }
      }
    } catch (error) {
      console.error("Զանգը մերժելու սխալ:", error);
    }
    hangup();
  };

  const acceptCall = async () => {
    if (!callId || !offerRef.current || !pcRef.current) return;
    try {
      const callDocRef = doc(db, "calls", callId);
      await pcRef.current.setRemoteDescription(
        new RTCSessionDescription(offerRef.current),
      );
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      await updateDoc(callDocRef, {
        answer: { type: answer.type, sdp: answer.sdp },
        status: "connected",
      });
      setStatus("connected");
    } catch (error) {
      console.error("Զանգն ընդունելու սխալ:", error);
    }
  };

  useEffect(() => {
    let unsubCall = null;
    let unsubCandidates = null;

    const start = async () => {
      pcRef.current = new RTCPeerConnection(servers);
      pcRef.current.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };

      // Անվտանգ միացնում ենք միկրոֆոնը
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        localStreamRef.current = localStream;
        localStream
          .getTracks()
          .forEach((track) => pcRef.current.addTrack(track, localStream));
      } catch (audioError) {
        // Եթե միկրոֆոն չկա, կոդը չի կրաշվում, այլ շարունակում է միայն լսելու ռեժիմով
        console.warn(
          "Միկրոֆոն չի գտնվել կամ թույլտվությունը մերժվել է: Միանում է միայն լսելու ռեժիմով:",
          audioError,
        );
      }

      const callDocRef = doc(db, "calls", callId);
      const callerCandidatesCol = collection(callDocRef, "callerCandidates");
      const calleeCandidatesCol = collection(callDocRef, "calleeCandidates");

      pcRef.current.onicecandidate = async (event) => {
        if (event.candidate) {
          try {
            await addDoc(
              mode === "offer" ? callerCandidatesCol : calleeCandidatesCol,
              event.candidate.toJSON(),
            );
          } catch (error) {
            console.error("ICE Candidate ավելացնելու սխալ:", error);
          }
        }
      };

      if (mode === "offer") {
        // Կարևոր է. offerToReceiveAudio-ն թույլ է տալիս լսել դիմացինին, նույնիսկ եթե մեր միկրոֆոնը չկա
        const offer = await pcRef.current.createOffer({
          offerToReceiveAudio: true,
        });
        await pcRef.current.setLocalDescription(offer);
        await setDoc(callDocRef, {
          caller: caller?.uid,
          callee: callee?.uid,
          type: "audio",
          offer: { type: offer.type, sdp: offer.sdp },
          status: "ringing",
        });

        unsubCall = onSnapshot(callDocRef, (snap) => {
          const data = snap.data();
          if (data?.answer && !pcRef.current.currentRemoteDescription) {
            pcRef.current.setRemoteDescription(
              new RTCSessionDescription(data.answer),
            );
            setStatus("connected");
          }
          if (data?.status === "rejected" || data?.status === "ended") hangup();
        });

        unsubCandidates = onSnapshot(calleeCandidatesCol, (snap) => {
          snap.docChanges().forEach((change) => {
            if (change.type === "added")
              pcRef.current.addIceCandidate(
                new RTCIceCandidate(change.doc.data()),
              );
          });
        });
      } else {
        unsubCall = onSnapshot(callDocRef, (snap) => {
          const data = snap.data();
          if (data?.offer && !offerRef.current) {
            offerRef.current = data.offer;
            setStatus("incoming");
          }
          if (data?.status === "ended" || data?.status === "rejected") hangup();
        });

        unsubCandidates = onSnapshot(callerCandidatesCol, (snap) => {
          snap.docChanges().forEach((change) => {
            if (change.type === "added")
              pcRef.current.addIceCandidate(
                new RTCIceCandidate(change.doc.data()),
              );
          });
        });
      }
    };

    start().catch((error) => {
      console.error("Ընդհանուր համակարգային սխալ:", error);
      hangup();
    });

    return () => {
      if (unsubCall) unsubCall();
      if (unsubCandidates) unsubCandidates();
    };
  }, [callId, mode, caller, callee, hangup]);

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:bottom-8 sm:left-auto sm:right-8 z-[100] animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`relative bg-gray-900/90 backdrop-blur-xl border border-white/10 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl flex items-center gap-3 sm:gap-5 w-full sm:w-80 overflow-hidden ${
          status === "calling" || status === "incoming"
            ? "ring-2 ring-orange-500/50 shadow-orange-500/20"
            : "ring-1 ring-white/20"
        }`}
      >
        <div className="flex-1 min-w-0 z-10">
          <div className="text-white font-semibold truncate text-xs sm:text-sm">
            {mode === "offer" ? callee?.name : caller?.name}
          </div>
          <div className="text-xs font-medium flex items-center gap-1 mt-0.5">
            {status === "incoming" && (
              <span className="text-orange-400 animate-pulse">
                Ներգնա աուդիոզանգ...
              </span>
            )}
            {status === "calling" && (
              <span className="text-blue-400 animate-pulse">Զանգում է...</span>
            )}
            {status === "connected" && (
              <span className="text-green-400">Զրույցն ընթացքում է</span>
            )}

            
          </div>
        </div>
        <div className="flex items-center gap-2 z-10 flex-shrink-0">
          {status === "incoming" ? (
            <>
              <button
                onClick={acceptCall}
                className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center"
              >
                ✓
              </button>
              <button
                onClick={rejectCall}
                className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center"
              >
                ✗
              </button>
            </>
          ) : (
            <button
              onClick={hangup}
              className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center"
            >
              ✗
            </button>
          )}
        </div>
      </div>
      <audio ref={remoteAudioRef} autoPlay className="hidden" />
    </div>
  );
}
