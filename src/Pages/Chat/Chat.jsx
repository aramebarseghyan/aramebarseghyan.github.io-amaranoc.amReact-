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

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("general");
  const [outgoingCallId, setOutgoingCallId] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  const chatContainerRef = useRef(null);

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

  // ✨ ՈՒՂՂՎԱԾ Է. Հիմա ցույց կտա և՛ զանգի պահը, և՛ խոսելու պահը, մինչև status-ը չդառնա ended
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
        // Ցույց տալ միայն եթե ընտրված է այն օգտատերը, ով զանգում է, կամ եթե ընդհանուր չատում չենք
        if (selectedUser !== "general" && data.caller === selectedUser.uid) {
          activeCall = { id: docSnap.id, data };
        }
      });
      setIncomingCall(activeCall);
    });

    return () => unsub();
  }, [selectedUser]);

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

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages.length, selectedUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !selectedUser) return;

    if (!auth.currentUser) {
      alert("Նամակ գրելու համար խնդրում ենք մուտք գործել կամ գրանցվել:");
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
        {/* ՁԱԽ ՊԱՆԵԼ: Օգտատերերի ցանկ */}
        <div className="hidden sm:flex w-full sm:w-64 md:w-80 border-r border-gray-100 flex-col bg-white overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 bg-white">
            <h2 className="text-gray-900 text-lg sm:text-xl font-bold tracking-tight">
              Չատեր
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1">
            {/* Ընդհանուր չատ */}
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

            {/* Անձնական չատեր */}
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

        {/* ԱՋ ՊԱՆԵԼ: Չատի հատված */}
        <div className="flex-1 flex flex-col bg-[#f8f9fa] relative">
          {/* Վերնագիր */}
          <div className="p-4 border-b border-gray-200 bg-white/80 backdrop-blur-md flex items-center gap-4 z-10 absolute top-0 w-full shadow-sm">
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
                <div>
                  <h2 className="text-gray-900 text-base font-bold leading-tight">
                    {selectedUser.name}
                  </h2>
                  <span className="text-xs text-green-500 font-medium">
                    Առցանց
                  </span>
                </div>

                {/* Զանգի կոճակ (Գեղեցկացված) */}
                <button
                  onClick={async () => {
                    if (!auth.currentUser) return;
                    const callRef = doc(collection(db, "calls"));
                    setOutgoingCallId(callRef.id);
                  }}
                  className="ml-auto flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 transform active:scale-95 font-medium text-sm sm:text-base"
                  title="Զանգել"
                >
                  <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM19 12h2a9 9 0 0 0-9-9v2c3.87 0 7 3.13 7 7zm-4 0h2c0-2.76-2.24-5-5-5v2c1.66 0 3 1.34 3 3z" />
                  </svg>
                  <span className="hidden sm:inline">Զանգել</span>
                </button>
              </>
            )}
          </div>

          {/* Նամակներ */}
          <div
            ref={chatContainerRef}
            className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-3 sm:space-y-6 pt-20 sm:pt-24 pb-24 sm:pb-20"
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
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    ></path>
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">
                  Նամակագրությունը դատարկ է
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Ուղարկեք առաջին նամակը
                </p>
              </div>
            )}
          </div>

          {/* Տեքստի մուտքագրում */}
          <form
            onSubmit={handleSubmit}
            className="p-3 sm:p-4 border-t border-gray-200 bg-white/80 backdrop-blur-md sticky bottom-0 w-full flex gap-2 sm:gap-3 items-center z-10"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                !auth.currentUser
                  ? "Մուտք գործեք..."
                  : selectedUser === "general"
                    ? "Գրել չատում..."
                    : `Գրել ${selectedUser.name}-ին...`
              }
              disabled={!auth.currentUser}
              className="flex-1 rounded-xl sm:rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-5 py-2 sm:py-3 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50 disabled:opacity-50 text-sm sm:text-base text-gray-700"
            />
            <button
              type="submit"
              disabled={!auth.currentUser}
              className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-2xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 text-sm sm:text-base flex-shrink-0"
            >
              <span className="hidden sm:inline">Ուղարկել</span>
              <span className="sm:hidden">→</span>
            </button>
          </form>
        </div>

        {/* ԶԱՆԳԻ ՎԻՋԵԹՆԵՐԸ */}
        {outgoingCallId && selectedUser !== "general" && (
          <Call
            mode="offer"
            callId={outgoingCallId}
            caller={auth.currentUser}
            callee={selectedUser}
            onClose={() => setOutgoingCallId(null)}
          />
        )}

        {incomingCall && (
          <Call
            mode="answer"
            callId={incomingCall.id}
            caller={{ uid: incomingCall.data.caller, name: "Ներգնա Զանգ" }} // name-ը կարող ես փոխել իրականով
            callee={auth.currentUser}
            onClose={() => setIncomingCall(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Chat;
