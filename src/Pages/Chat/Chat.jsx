import { useState, useEffect, useRef } from "react";
import { auth, db } from "../../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("general"); // Լռելյայն բացվում է ընդհանուր չատը
  const messagesEndRef = useRef(null);

  // 1. Բեռնում ենք բոլոր օգտատերերին ձախ պանելի համար
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

  // 2. Բեռնում ենք հաղորդագրությունները՝ կախված ընտրված չատի տեսակից
  useEffect(() => {
    if (!auth.currentUser || !selectedUser) return;

    let q;

    if (selectedUser === "general") {
      // Եթե ընտրված է ընդհանուր չատը
      q = query(collection(db, "messages"), orderBy("createdAtMs", "asc"));
    } else {
      // Եթե ընտրված է անձնական չատ
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

  // Scroll to bottom when messages update
  useEffect(() => {
    const id = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    return () => clearTimeout(id);
  }, [messages]);

  // Ensure scroll to bottom when switching chats
  useEffect(() => {
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "auto" }),
      0,
    );
  }, [selectedUser]);

  // 3. Հաղորդագրություն ուղարկելը
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !selectedUser) return;

    const { uid, displayName, photoURL } = auth.currentUser;

    try {
      if (selectedUser === "general") {
        // Ուղարկում ենք ընդհանուր չատին
        await addDoc(collection(db, "messages"), {
          text: newMessage,
          name: displayName || "Անանուն",
          avatar: photoURL || "https://via.placeholder.com/40",
          uid: uid,
          createdAt: serverTimestamp(),
          createdAtMs: Date.now(),
        });
      } else {
        // Ուղարկում ենք անձնական չատին
        const currentUid = uid;
        const targetUid = selectedUser.uid;
        const chatId = [currentUid, targetUid].sort().join("_");

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
    <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center p-4">
      <div className="w-full max-w-[900px] bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-row h-[80vh]">
        {/* ՁԱԽ ՊԱՆԵԼ: Չատեր և Օգտատերեր */}
        <div className="w-[280px] border-r border-gray-100 flex flex-col bg-white rounded-l-2xl">
          <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-tl-2xl">
            <h2 className="text-gray-800 text-lg font-bold">Չատեր</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {/* ԿՈՃԱԿ: Ընդհանուր չատ */}
            <div
              onClick={() => setSelectedUser("general")}
              className={`flex items-center gap-3 p-3 rounded-xl transition cursor-pointer ${
                selectedUser === "general"
                  ? "bg-orange-50 border border-orange-100"
                  : "hover:bg-gray-50 border border-transparent"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#ff9f43] flex items-center justify-center text-white font-bold shadow-sm text-lg">
                #
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-sm font-bold ${selectedUser === "general" ? "text-[#ff9f43]" : "text-gray-700"}`}
                >
                  Ընդհանուր չատ
                </span>
                <span className="text-xs text-gray-400">Հանրային սենյակ</span>
              </div>
            </div>

            {/* Բաժանարար գիծ */}
            <div className="border-t border-gray-100 my-2 pt-2">
              <span className="text-xs font-semibold text-gray-400 px-2 uppercase tracking-wider">
                Օգտատերեր
              </span>
            </div>

            {/* Անձնական չատերի ցուցակ */}
            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user.id || user.uid}
                  onClick={() => setSelectedUser(user)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition cursor-pointer ${
                    selectedUser?.uid === user.uid
                      ? "bg-orange-50 border border-orange-100"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <img
                    src={user.avatar || "https://via.placeholder.com/40"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover shadow-sm"
                  />
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-semibold ${selectedUser?.uid === user.uid ? "text-[#ff9f43]" : "text-gray-700"}`}
                    >
                      {user.name || "Անանուն"}
                    </span>
                    <span className="text-xs text-gray-400">
                      Անձնական նամակ
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center mt-4">
                Այլ օգտատերեր չկան
              </p>
            )}
          </div>
        </div>

        {/* ԱՋ ՊԱՆԵԼ: Չատի հատված */}
        <div className="flex-1 flex flex-col bg-gray-50/30 rounded-r-2xl">
          {/* Չատի վերնագիր (Փոխվում է ըստ ընտրության) */}
          <div className="p-4 border-b border-gray-100 bg-[#ff9f43] rounded-tr-2xl flex items-center gap-3">
            {selectedUser === "general" ? (
              <>
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg border border-white/40">
                  #
                </div>
                <h2 className="text-white text-lg font-bold">Ընդհանուր չատ</h2>
              </>
            ) : (
              <>
                <img
                  src={selectedUser.avatar || "https://via.placeholder.com/40"}
                  alt="avatar"
                  className="w-9 h-9 rounded-full object-cover border-2 border-white"
                />
                <h2 className="text-white text-lg font-bold">
                  {selectedUser.name}
                </h2>
              </>
            )}
          </div>

          {/* Հաղորդագրություններ */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.length > 0 ? (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.uid === auth.currentUser?.uid ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-3 max-w-[70%] ${msg.uid === auth.currentUser?.uid ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <img
                      src={msg.avatar || "https://via.placeholder.com/40"}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover shadow-sm"
                    />
                    <div
                      className={`flex flex-col ${msg.uid === auth.currentUser?.uid ? "items-end" : "items-start"}`}
                    >
                      <span className="text-xs text-gray-500 mb-1">
                        {msg.name}
                      </span>
                      <div
                        className={`px-4 py-2 rounded-2xl shadow-sm ${
                          msg.uid === auth.currentUser?.uid
                            ? "bg-[#ff9f43] text-white rounded-tr-none"
                            : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 text-sm mt-10">
                Նամակագրությունը դատարկ է:
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Տեքստի ներմուծման դաշտ */}
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-gray-100 flex gap-2 bg-white rounded-br-2xl"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                selectedUser === "general"
                  ? "Գրել ընդհանուր չատում..."
                  : `Գրել ${selectedUser.name}-ին...`
              }
              className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 outline-none transition focus:border-[#ff9f43] focus:bg-white"
            />
            <button
              type="submit"
              className="bg-[#ff9f43] text-white px-6 py-2 rounded-full font-medium shadow-md hover:bg-[#f08f33] transition"
            >
              Ուղարկել
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
