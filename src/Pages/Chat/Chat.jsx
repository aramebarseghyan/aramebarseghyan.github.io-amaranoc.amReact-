import { useState, useEffect, useRef } from "react";
import { auth, db } from "../../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
} from "firebase/firestore";
import Call from "./Call";
import VideoCall from "./VideoCall";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("general");

  // Զանգերի State-ներ
  const [outgoingCallId, setOutgoingCallId] = useState(null);
  const [outgoingVideoCallId, setOutgoingVideoCallId] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  const chatContainerRef = useRef(null);

  // Ստանալ օգտատերերին
  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let usersList = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.uid !== auth.currentUser?.uid) {
          usersList.push({ ...userData, id: doc.id });
        }
      });
      setUsers(usersList);
    });
    return () => unsubscribe();
  }, []);

  // Ստուգել ներգնա զանգերը
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "calls"),
      where("callee", "==", auth.currentUser.uid),
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
  }, [selectedUser]);

  // Ստանալ նամակները
  useEffect(() => {
    if (!selectedUser) return;
    let q;
    if (selectedUser === "general") {
      q = query(collection(db, "messages"), orderBy("createdAtMs", "asc"));
    } else {
      if (!auth.currentUser) return;
      const currentUid = auth.currentUser.uid;
      const targetUid = selectedUser.uid;
      const chatId = [currentUid, targetUid].sort().join("_");
      q = query(
        collection(db, "chats", chatId, "messages"),
        orderBy("createdAtMs", "asc"),
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let msgs = [];
      snapshot.forEach((doc) => {
        msgs.push({ ...doc.data(), id: doc.id });
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedUser]);

  // Ավտոմատ իջնել ներքև
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages.length, selectedUser]);

  // Ուղարկել նամակ
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !selectedUser) return;
    if (!auth.currentUser) {
      alert("Նամակ գրելու համար խնդրում ենք մուտք գործել:");
      return;
    }

    const { uid, displayName, photoURL } = auth.currentUser;
    try {
      if (selectedUser === "general") {
        await addDoc(collection(db, "messages"), {
          text: newMessage,
          name: displayName || "Անանուն",
          avatar: photoURL || "https://via.placeholder.com/40",
          uid: uid,
          createdAt: serverTimestamp(),
          createdAtMs: Date.now(),
        });
      } else {
        const chatId = [uid, selectedUser.uid].sort().join("_");
        await addDoc(collection(db, "chats", chatId, "messages"), {
          text: newMessage,
          name: displayName || "Անանուն",
          avatar: photoURL || "https://via.placeholder.com/40",
          uid: uid,
          createdAt: serverTimestamp(),
          createdAtMs: Date.now(),
        });
      }
      setNewMessage("");
    } catch (error) {
      console.error("Հաղորդագրությունը չուղարկվեց՝", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:items-center md:justify-center md:p-6 overflow-hidden">
      <div className="w-full max-w-6xl bg-white md:rounded-3xl shadow-xl shadow-gray-200/50 md:border border-gray-100 flex flex-row h-full md:h-[85vh] overflow-hidden">
        {/* ՁԱԽ ՊԱՆԵԼ */}
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
                <h2 className="text-gray-900 text-lg font-bold">
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
                  {/* ԱՈՒԴԻՈ ԶԱՆԳԻ ԿՈՃԱԿ */}
                  <button
                    onClick={() => {
                      if (!auth.currentUser) return;
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

                  {/* ՎԻԴԵՈ ԶԱՆԳԻ ԿՈՃԱԿ */}
                  <button
                    onClick={() => {
                      if (!auth.currentUser) return;
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
                const isMine = msg.uid === auth.currentUser?.uid;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex gap-3 max-w-[75%] ${isMine ? "flex-row-reverse" : "flex-row"}`}
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
                        <div
                          className={`px-5 py-3 shadow-sm text-[15px] leading-relaxed ${
                            isMine
                              ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-3xl rounded-br-sm"
                              : "bg-white border border-gray-100 text-gray-800 rounded-3xl rounded-bl-sm"
                          }`}
                        >
                          {msg.text}
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

          {/* Մուտքագրում */}
          <form
            onSubmit={handleSubmit}
            className="p-3 sm:p-4 border-t border-gray-200 bg-white/80 backdrop-blur-md flex gap-2 sm:gap-3 items-center z-10 flex-shrink-0"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Գրեք նամակ..."
              disabled={!auth.currentUser}
              className="flex-1 rounded-xl sm:rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-5 py-2 sm:py-3 outline-none focus:border-orange-400 focus:bg-white text-sm sm:text-base"
            />
            <button
              type="submit"
              disabled={!auth.currentUser}
              className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-2xl font-bold shadow-lg shadow-orange-500/30 text-sm sm:text-base"
            >
              Ուղարկել
            </button>
          </form>
        </div>

        {/* --- ԶԱՆԳԻ ՎԻՋԵԹՆԵՐ --- */}

        {/* Ելքային Աուդիո Զանգ */}
        {outgoingCallId && selectedUser !== "general" && (
          <Call
            mode="offer"
            callId={outgoingCallId}
            caller={auth.currentUser}
            callee={selectedUser}
            onClose={() => setOutgoingCallId(null)}
          />
        )}

        {/* Ելքային Վիդեո Զանգ */}
        {outgoingVideoCallId && selectedUser !== "general" && (
          <VideoCall
            mode="offer"
            callId={outgoingVideoCallId}
            caller={auth.currentUser}
            callee={selectedUser}
            onClose={() => setOutgoingVideoCallId(null)}
          />
        )}

        {/* Ներգնա Զանգեր (Աուդիո կամ Վիդեո) */}
        {incomingCall && incomingCall.data.type === "audio" && (
          <Call
            mode="answer"
            callId={incomingCall.id}
            caller={{ uid: incomingCall.data.caller, name: "Ներգնա Զանգ" }}
            callee={auth.currentUser}
            onClose={() => setIncomingCall(null)}
          />
        )}

        {incomingCall && incomingCall.data.type === "video" && (
          <VideoCall
            mode="answer"
            callId={incomingCall.id}
            caller={{ uid: incomingCall.data.caller, name: "Ներգնա Վիդեոզանգ" }}
            callee={auth.currentUser}
            onClose={() => setIncomingCall(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Chat;
