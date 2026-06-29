import { useEffect, useRef, useState, useCallback } from "react";
import { db } from "../../firebase";
import { doc, setDoc, updateDoc, onSnapshot, collection, addDoc } from "firebase/firestore";

const servers = { iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }] };

export default function VideoCall({ mode, callId, caller, callee, onClose }) {
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const offerRef = useRef(null);
  const [status, setStatus] = useState(mode === "offer" ? "calling" : "incoming");

  const hangup = useCallback(async () => {
    try {
      if (callId) {
        await updateDoc(doc(db, "calls", callId), { status: "ended" });
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
        await updateDoc(doc(db, "calls", callId), { status: "rejected" });
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
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(offerRef.current));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      await updateDoc(callDocRef, { 
        answer: { type: answer.type, sdp: answer.sdp }, 
        status: "connected" 
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
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Միացնում ենք տեսախցիկը և միկրոֆոնը
      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = localStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
      localStream.getTracks().forEach((track) => pcRef.current.addTrack(track, localStream));

      const callDocRef = doc(db, "calls", callId);
      const callerCandidatesCol = collection(callDocRef, "callerCandidates");
      const calleeCandidatesCol = collection(callDocRef, "calleeCandidates");

      pcRef.current.onicecandidate = async (event) => {
        if (event.candidate) {
          try {
            await addDoc(mode === "offer" ? callerCandidatesCol : calleeCandidatesCol, event.candidate.toJSON());
          } catch (error) {
            console.error("ICE Candidate ավելացնելու սխալ:", error);
          }
        }
      };

      if (mode === "offer") {
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        await setDoc(callDocRef, {
          caller: caller?.uid,
          callee: callee?.uid,
          type: "video",
          offer: { type: offer.type, sdp: offer.sdp },
          status: "ringing",
        });

        unsubCall = onSnapshot(callDocRef, (snap) => {
          const data = snap.data();
          if (data?.answer && !pcRef.current.currentRemoteDescription) {
            pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            setStatus("connected");
          }
          if (data?.status === "rejected" || data?.status === "ended") hangup();
        });

        unsubCandidates = onSnapshot(calleeCandidatesCol, (snap) => {
          snap.docChanges().forEach((change) => {
            if (change.type === "added") pcRef.current.addIceCandidate(new RTCIceCandidate(change.doc.data()));
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
            if (change.type === "added") pcRef.current.addIceCandidate(new RTCIceCandidate(change.doc.data()));
          });
        });
      }
    };

    start().catch((error) => {
      console.error("Վիդեո սարքավորման սխալ:", error);
      alert("Խնդրում ենք բրաուզերում թույլատրել տեսախցիկի և միկրոֆոնի հասանելիությունը:");
      hangup();
    });

    return () => {
      if (unsubCall) unsubCall();
      if (unsubCandidates) unsubCandidates();
    };
  }, [callId, mode, caller, callee, hangup]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
      <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="absolute bottom-24 right-4 sm:bottom-8 sm:right-8 w-28 h-40 sm:w-40 sm:h-56 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-white/20 z-10">
        <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900/80 backdrop-blur-md px-6 py-4 rounded-full flex items-center gap-6 shadow-2xl border border-white/10 z-20">
        <div className="text-white font-medium mr-4 hidden sm:block">
          {mode === "offer" ? callee?.name : caller?.name}
          <span className="block text-xs text-gray-400">
            {status === "incoming" ? "Ներգնա վիդեոզանգ..." : status === "calling" ? "Զանգում է..." : "Միացված է"}
          </span>
        </div>

        {status === "incoming" ? (
          <>
            <button onClick={acceptCall} className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full">✓</button>
            <button onClick={rejectCall} className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full">✗</button>
          </>
        ) : (
          <button onClick={hangup} className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full">✗</button>
        )}
        
      </div>
    </div>
  );
}