import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { FaPaperPlane } from "react-icons/fa";

// Firebase
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  updateDoc
} from "firebase/firestore";

const Home = () => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);

  const chatEndRef = useRef(null);
  const user = auth.currentUser;

  // 🔽 Auto Scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 📂 Load chats
  useEffect(() => {
    if (!user) return;

    const q = collection(db, "users", user.uid, "chats");

    const unsub = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setChats(chatList);
    });

    return () => unsub();
  }, [user]);

  // 💬 Load messages
  useEffect(() => {
    if (!selectedChat || !user) return;

    const q = query(
      collection(db, "users", user.uid, "chats", selectedChat.id, "messages"),
      orderBy("createdAt")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => doc.data());
      setMessages(msgs);
    });

    return () => unsub();
  }, [selectedChat, user]);

  // ➕ New chat
  const handleNewChat = async () => {
    if (!user) return;

    const docRef = await addDoc(
      collection(db, "users", user.uid, "chats"),
      {
        name: "New Chat",
        createdAt: new Date()
      }
    );

    setSelectedChat({ id: docRef.id, name: "New Chat" });
    setMessages([]);
  };

  // 🚀 SEND MESSAGE
  const handleSend = async () => {
    if (!currentMessage.trim()) return;
    if (!auth.currentUser) return alert("Login required");

    let chat = selectedChat;

    // Auto create chat
    if (!chat) {
      const docRef = await addDoc(
        collection(db, "users", auth.currentUser.uid, "chats"),
        {
          name: currentMessage.split(" ").slice(0, 4).join(" "),
          createdAt: new Date()
        }
      );

      chat = { id: docRef.id };
      setSelectedChat(chat);
    }

    const msgRef = collection(
      db,
      "users",
      auth.currentUser.uid,
      "chats",
      chat.id,
      "messages"
    );

    // Save user message
    await addDoc(msgRef, {
      text: currentMessage,
      sender: "user",
      createdAt: new Date()
    });

    const userInput = currentMessage;
    setCurrentMessage("");

    try {
      const res = await fetch(process.env.REACT_APP_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userInput
        })  
      });

      const data = await res.json();
      const aiText = data.reply || "No response from server";

      // Save AI message
      await addDoc(msgRef, {
        text: aiText,
        sender: "ai",
        createdAt: new Date()
      });

      // Update chat title
      if (selectedChat?.name === "New Chat") {
        const chatRef = doc(
          db,
          "users",
          auth.currentUser.uid,
          "chats",
          chat.id
        );

        await updateDoc(chatRef, {
          name: userInput.split(" ").slice(0, 4).join(" ")
        });
      }

    } catch (err) {
      console.error("Flask ERROR:", err);

      await addDoc(msgRef, {
        text: "Server error",
        sender: "ai",
        createdAt: new Date()
      });
    }
  };

  return (
    <div className="grid h-screen" style={{ gridTemplateColumns: "auto 1fr" }}>
      
      <Sidebar
        chats={chats}
        onSelectChat={setSelectedChat}
        onNewChat={handleNewChat}
      />

      <div className="flex flex-col bg-black h-screen">

        {/* HEADER */}
        <div className="p-4 border-b border-gray-800 text-white font-semibold">
          {selectedChat?.name || "Select Chat"}
        </div>

        {/* ✅ FIXED CHAT AREA */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-4 py-6 space-y-4 scroll-smooth">

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`
                    max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed
                    break-words whitespace-pre-wrap
                    ${
                      msg.sender === "user"
                        ? "bg-green-500 text-black"
                        : "bg-zinc-800 text-white"
                    }
                  `}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* INPUT */}
        <div className="p-4 border-t border-gray-800 flex gap-2">
          <input
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full bg-zinc-900 text-white outline-none"
          />

          <button
            onClick={handleSend}
            className="p-3 bg-green-500 rounded-full hover:scale-105 transition"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;