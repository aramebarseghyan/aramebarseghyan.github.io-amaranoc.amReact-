import { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  deleteDoc, // ԱՎԵԼԱՑՎԵԼ Է՝ ջնջելու ֆունկցիան
} from "firebase/firestore";
import Call from "./Call";
import VideoCall from "./VideoCall";

const Chat = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("general");
  const [authReady, setAuthReady] = useState(false);

  // Զանգերի State-ներ
  const [outgoingCallId, setOutgoingCallId] = useState(null);
  const [outgoingVideoCallId, setOutgoingVideoCallId] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  // Ձայնային նամակների State-ներ
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const isCancelledRef = useRef(false);

  const chatContainerRef = useRef(null);

  // Հետևել օգտատիրոջ մուտքին
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthReady(true);
      if (user) {
        await setDoc(
          doc(db, "users", user.uid),
          {
            uid: user.uid,
            name: user.displayName || user.email || "Անանուն",
            email: user.email,
            avatar: user.photoURL || "https://via.placeholder.com/40",
            lastSeen: serverTimestamp(),
          },
          { merge: true },
        );
        setSelectedUser((prev) => (prev ? prev : "general"));
      } else {
        setMessages([]);
        setSelectedUser("general");
      }
    });
    return () => unsubscribe();
  }, []);

  // Ստանալ օգտատերերին
  useEffect(() => {
    if (!authReady || !currentUser?.uid) {
      setUsers([]);
      return;
    }
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let usersList = [];
      snapshot.forEach((docSnap) => {
        const userData = docSnap.data();
        if (userData.uid !== currentUser?.uid) {
          usersList.push({ ...userData, id: docSnap.id });
        }
      });
      setUsers(usersList);
    });
    return () => unsubscribe();
  }, [authReady, currentUser]);

  // Ստուգել ներգնա զանգերը
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "calls"),
      where("callee", "==", currentUser.uid),
      where("status", "in", ["ringing", "connected"]),
    );
    const unsub = onSnapshot(q, (snapshot) => {
      let activeCall = null;
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (selectedUser !== "general" && data.caller === selectedUser.uid) {
          activeCall = { id: docSnap.id, data };
        }
      });
      setIncomingCall(activeCall);
    });
    return () => unsub();
  }, [selectedUser, currentUser]);

  const getChatId = (targetUser) => {
    if (!currentUser?.uid || !targetUser?.uid) return null;
    return [currentUser.uid, targetUser.uid].sort().join("_");
  };

  const getMessagesCollection = (targetUser) => {
    if (targetUser === "general") return collection(db, "messages");
    const chatId = getChatId(targetUser);
    if (!chatId) return null;
    return collection(db, "chats", chatId, "messages");
  };

  // Ստանալ նամակները
  useEffect(() => {
    if (!selectedUser) return;
    const isGeneralChat = selectedUser === "general";
    if (!isGeneralChat && !currentUser?.uid) {
      setMessages([]);
      return;
    }
    const messagesCollection = getMessagesCollection(selectedUser);
    if (!messagesCollection) return;

    const q = query(messagesCollection, orderBy("createdAtMs", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let msgs = [];
      snapshot.forEach((doc) => {
        msgs.push({ ...doc.data(), id: doc.id });
      });
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [selectedUser, currentUser]);

  // Ավտոմատ սքրոլ ներքև
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages.length, selectedUser]);

  // --- ՁԱՅՆԱԳՐՈՒԹՅԱՆ ԺԱՄԱՉԱՓ ---
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (time) => {
    const mins = Math.floor(time / 60)
      .toString()
      .padStart(2, "0");
    const secs = (time % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // Ուղարկել տեքստ
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    if (!currentUser?.uid) return;

    const { uid, displayName, photoURL } = currentUser;
    try {
      const payload = {
        text: newMessage.trim(),
        name: displayName || "Անանուն",
        avatar: photoURL || "https://via.placeholder.com/40",
        uid,
        createdAt: serverTimestamp(),
        createdAtMs: Date.now(),
      };
      const messagesCollection = getMessagesCollection(selectedUser);
      if (!messagesCollection) return;
      await addDoc(messagesCollection, payload);
      setNewMessage("");
    } catch (error) {
      console.error("Հաղորդագրությունը չուղարկվեց՝", error);
    }
  };

  // --- ՆՈՐ ՖՈՒՆԿՑԻԱ՝ Նամակը ջնջելու համար ---
  const deleteMessage = async (msgId) => {
    const confirmDelete = window.confirm(
      "Վստա՞հ եք, որ ուզում եք ջնջել այս նամակը:",
    );
    if (!confirmDelete) return;

    try {
      const messagesCollection = getMessagesCollection(selectedUser);
      if (!messagesCollection) return;

      // Ջնջում ենք նամակը բազայից ըստ իր ID-ի
      await deleteDoc(doc(messagesCollection, msgId));
    } catch (error) {
      console.error("Սխալ նամակը ջնջելիս՝", error);
    }
  };

  // Սկսել ձայնագրումը
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      isCancelledRef.current = false;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        if (!isCancelledRef.current) {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result;
            await sendAudioMessage(base64Audio);
          };
        }
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Միկրոֆոնի սխալ:", error);
      alert("Միկրոֆոնին միանալու խնդիր։ Ստուգեք թույլտվությունները։");
    }
  };

  // Ավարտել և ուղարկել ձայնագրությունը
  const stopAndSendRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      isCancelledRef.current = false;
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Չեղարկել ձայնագրությունը
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      isCancelledRef.current = true;
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Ուղարկել ձայնային հաղորդագրությունը
  const sendAudioMessage = async (audioData) => {
    if (!selectedUser || !currentUser?.uid) return;
    const { uid, displayName, photoURL } = currentUser;
    try {
      const payload = {
        text: "",
        audio: audioData,
        name: displayName || "Անանուն",
        avatar: photoURL || "https://via.placeholder.com/40",
        uid,
        createdAt: serverTimestamp(),
        createdAtMs: Date.now(),
      };
      const messagesCollection = getMessagesCollection(selectedUser);
      if (!messagesCollection) return;
      await addDoc(messagesCollection, payload);
    } catch (error) {
      console.error("Ձայնային հաղորդագրությունը չուղարկվեց՝", error);
    }
  };

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="rounded-2xl border border-gray-100 bg-white px-6 py-5 text-sm font-medium text-gray-600 shadow-sm">
          Մուտք է գործում…
        </div>
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:items-center md:justify-center md:p-6 overflow-hidden">
      <div className="w-full max-w-6xl bg-white md:rounded-3xl shadow-xl shadow-gray-200/50 md:border border-gray-100 flex flex-row h-full md:h-[85vh] overflow-hidden">
        {/* ՁԱԽ ՊԱՆԵԼ (Օգտատերերի ցանկ) */}
        <div className="hidden sm:flex w-full sm:w-64 md:w-80 border-r border-gray-100 flex-col bg-white overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 bg-white">
            <h2 className="text-gray-900 text-lg sm:text-xl font-bold tracking-tight">
              Չատեր
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1">
            <div
              onClick={() => setSelectedUser("general")}
              className={`flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                selectedUser === "general"
                  ? "bg-gradient-to-r from-orange-50 to-orange-100/50 shadow-sm"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-md text-xl">
                #
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-base font-bold ${selectedUser === "general" ? "text-orange-600" : "text-gray-800"}`}
                >
                  Ընդհանուր չատ
                </span>
                <span className="text-xs text-gray-500">Հանրային սենյակ</span>
              </div>
            </div>

            <div className="py-2">
              <span className="text-[11px] font-bold text-gray-400 px-3 uppercase tracking-wider">
                Օգտատերեր
              </span>
            </div>

            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user.id || user.uid}
                  onClick={() => setSelectedUser(user)}
                  className={`flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                    selectedUser?.uid === user.uid
                      ? "bg-gradient-to-r from-orange-50 to-orange-100/50 shadow-sm"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="relative">
                    <img
                      src={user.avatar || "https://via.placeholder.com/40"}
                      alt="avatar"
                      className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-100"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-bold ${selectedUser?.uid === user.uid ? "text-orange-600" : "text-gray-800"}`}
                    >
                      {user.name || "Անանուն"}
                    </span>
                    <span className="text-xs text-gray-500 truncate max-w-[120px]">
                      Անձնական նամակ
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center mt-6">
                Օգտատերեր չկան
              </p>
            )}
          </div>
        </div>

        {/* ԱՋ ՊԱՆԵԼ */}
        <div className="flex-1 flex flex-col bg-[#f8f9fa] overflow-hidden">
          {/* Վերնագիր և Զանգի կոճակներ */}
          <div className="p-3 sm:p-4 border-b border-gray-200 bg-white/80 backdrop-blur-md flex items-center gap-3 sm:gap-4 z-10 sticky top-0 w-full shadow-sm flex-shrink-0">
            {selectedUser === "general" ? (
              <>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  #
                </div>
                <h2 className="text-gray-900 text-lg font-bold flex-1">
                  Ընդհանուր չատ
                </h2>
              </>
            ) : (
              <>
                <img
                  src={selectedUser.avatar || "https://via.placeholder.com/40"}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-200"
                />
                <div className="flex-1">
                  <h2 className="text-gray-900 text-base font-bold leading-tight">
                    {selectedUser.name}
                  </h2>
                  <span className="text-xs text-green-500 font-medium">
                    Առցանց
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (!currentUser) return;
                      const callRef = doc(collection(db, "calls"));
                      setOutgoingCallId(callRef.id);
                    }}
                    className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white w-10 h-10 sm:w-auto sm:px-4 sm:py-2 rounded-full sm:rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 transform active:scale-95 justify-center"
                    title="Աուդիո զանգ"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM19 12h2a9 9 0 0 0-9-9v2c3.87 0 7 3.13 7 7zm-4 0h2c0-2.76-2.24-5-5-5v2c1.66 0 3 1.34 3 3z" />
                    </svg>
                    <span className="hidden sm:inline font-medium text-sm">
                      Զանգ
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      if (!currentUser) return;
                      const callRef = doc(collection(db, "calls"));
                      setOutgoingVideoCallId(callRef.id);
                    }}
                    className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white w-10 h-10 sm:w-auto sm:px-4 sm:py-2 rounded-full sm:rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform active:scale-95 justify-center"
                    title="Վիդեո զանգ"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                    </svg>
                    <span className="hidden sm:inline font-medium text-sm">
                      Վիդեո
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Նամակների Դաշտ */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scroll-smooth"
          >
            {messages.length > 0 ? (
              messages.map((msg) => {
                const isMine = msg.uid === currentUser?.uid;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${isMine ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {!isMine && (
                        <img
                          src={msg.avatar || "https://via.placeholder.com/40"}
                          alt="avatar"
                          className="w-8 h-8 rounded-full object-cover shadow-sm self-end mb-1"
                        />
                      )}

                      <div
                        className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                      >
                        {!isMine && (
                          <span className="text-[11px] text-gray-500 mb-1 ml-1">
                            {msg.name}
                          </span>
                        )}

                        {/* Փաթեթավորում ենք նամակը և ջնջելու կոճակը՝ կողք-կողքի դնելու համար */}
                        <div
                          className={`flex items-center gap-2 group ${isMine ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <div
                            className={`px-4 py-2 sm:px-5 sm:py-3 shadow-sm text-[15px] leading-relaxed ${
                              isMine
                                ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-3xl rounded-br-sm"
                                : "bg-white border border-gray-100 text-gray-800 rounded-3xl rounded-bl-sm"
                            }`}
                          >
                            {msg.text && <div>{msg.text}</div>}
                            {msg.audio && (
                              <div className="flex items-center gap-2 mt-1">
                                <audio
                                  controls
                                  src={msg.audio}
                                  className="h-8 max-w-[200px] outline-none"
                                />
                              </div>
                            )}
                          </div>

                          {/* ՋՆՋԵԼՈՒ ԿՈՃԱԿԸ - Երևում է միայն քո նամակների վրա */}
                          {isMine && (
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-1 bg-white rounded-full shadow-sm border border-gray-100"
                              title="Ջնջել նամակը"
                            >
                              <svg
                                className="w-4 h-4 fill-current"
                                viewBox="0 0 24 24"
                              >
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-50">
                <p className="text-gray-500 font-medium">
                  Նամակագրությունը դատարկ է
                </p>
              </div>
            )}
          </div>

          {/* ՄՈՒՏՔԱԳՐՈՒՄ */}
          <div className="p-3 sm:p-4 border-t border-gray-200 bg-white/80 backdrop-blur-md flex flex-col gap-3 z-10 flex-shrink-0">
            <div className="flex items-center gap-2 relative">
              {isRecording ? (
                <div className="flex-1 flex items-center justify-between bg-red-50 rounded-2xl h-12 px-4 border border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-500 font-mono font-medium tracking-wide">
                      {formatTime(recordingTime)}
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm hidden sm:block animate-pulse">
                    Ձայնագրվում է...
                  </span>

                  <button
                    onClick={cancelRecording}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    title="Ջնջել ձայնագրությունը"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                  placeholder="Գրեք նամակ..."
                  disabled={!currentUser}
                  className="flex-1 h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 outline-none focus:border-orange-400 focus:bg-white text-sm sm:text-base transition-all"
                />
              )}

              {newMessage.trim().length > 0 && !isRecording ? (
                <button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-orange-400 to-orange-500 text-white h-12 w-12 flex items-center justify-center rounded-2xl shadow-lg shadow-orange-500/30 hover:scale-105 transition-transform"
                >
                  <svg
                    className="w-5 h-5 fill-current transform rotate-[-45deg] ml-1"
                    viewBox="0 0 24 24"
                  >
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              ) : isRecording ? (
                <button
                  onClick={stopAndSendRecording}
                  className="bg-gradient-to-r from-green-400 to-green-500 text-white h-12 w-12 flex items-center justify-center rounded-2xl shadow-lg shadow-green-500/30 hover:scale-105 transition-transform"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  disabled={!currentUser}
                  className="bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-500 h-12 w-12 flex items-center justify-center rounded-2xl transition-colors"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- ԶԱՆԳԻ ՎԻՋԵԹՆԵՐ --- */}

        {outgoingCallId && selectedUser !== "general" && (
          <Call
            mode="offer"
            callId={outgoingCallId}
            caller={currentUser}
            callee={selectedUser}
            onClose={() => setOutgoingCallId(null)}
          />
        )}

        {outgoingVideoCallId && selectedUser !== "general" && (
          <VideoCall
            mode="offer"
            callId={outgoingVideoCallId}
            caller={currentUser}
            callee={selectedUser}
            onClose={() => setOutgoingVideoCallId(null)}
          />
        )}

        {incomingCall && incomingCall.data.type === "audio" && (
          <Call
            mode="answer"
            callId={incomingCall.id}
            caller={{ uid: incomingCall.data.caller, name: "Ներգնա Զանգ" }}
            callee={currentUser}
            onClose={() => setIncomingCall(null)}
          />
        )}

        {incomingCall && incomingCall.data.type === "video" && (
          <VideoCall
            mode="answer"
            callId={incomingCall.id}
            caller={{ uid: incomingCall.data.caller, name: "Ներգնա Վիդեոզանգ" }}
            callee={currentUser}
            onClose={() => setIncomingCall(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Chat;
