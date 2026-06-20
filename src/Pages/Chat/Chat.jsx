import { useState, useEffect } from "react";
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

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let msgs = [];
      snapshot.forEach((doc) => {
        msgs.push({ ...doc.data(), id: doc.id });
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    const { uid, displayName, photoURL } = auth.currentUser;

    await addDoc(collection(db, "messages"), {
      text: newMessage,
      name: displayName,
      avatar: photoURL,
      uid: uid,
      createdAt: serverTimestamp(),
    });

    setNewMessage("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center p-4">
      <div className="w-full max-w-[600px] bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[80vh]">
        {/* Չատի վերնագիր */}
        <div className="p-4 border-b border-gray-100 bg-[#ff9f43] rounded-t-2xl">
          <h2 className="text-white text-lg font-bold">Ընդհանուր չատ</h2>
        </div>

        {/* Հաղորդագրությունների հատված */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.uid === auth.currentUser?.uid ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex gap-3 max-w-[70%] ${msg.uid === auth.currentUser?.uid ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Ավատար */}
                <img
                  src={msg.avatar || "https://via.placeholder.com/40"}
                  alt="avatar"
                  className="w-10 h-10 rounded-full"
                />

                {/* Տեքստ և անուն */}
                <div
                  className={`flex flex-col ${msg.uid === auth.currentUser?.uid ? "items-end" : "items-start"}`}
                >
                  <span className="text-xs text-gray-500 mb-1">{msg.name}</span>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      msg.uid === auth.currentUser?.uid
                        ? "bg-[#ff9f43] text-white rounded-tr-none"
                        : "bg-gray-100 text-gray-800 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Մուտքի դաշտ */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-gray-100 flex gap-2"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Գրի հաղորդագրություն..."
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 outline-none transition focus:border-[#ff9f43]"
          />
          <button
            type="submit"
            className="bg-[#ff9f43] text-white px-6 py-2 rounded-full font-medium hover:bg-[#f08f33] transition"
          >
            Ուղարկել
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
