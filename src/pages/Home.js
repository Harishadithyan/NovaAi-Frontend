import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { FaPaperPlane, FaBars } from "react-icons/fa";

// ✅ IMPORT LOGO
import Logo from "../assets/logo.svg";

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

const API_URL =
  process.env.REACT_APP_API_URL ||
"https://novaai-backend-io56.onrender.com/chat";

const Home = () => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const user = auth.currentUser;

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto focus
  useEffect(() => {
    inputRef.current?.focus();
  }, [selectedChat]);

  // Load chats
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

  // Load messages
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

  // New chat
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
    setShowSidebar(false);
  };

  // Send message
  const handleSend = async () => {
    if (!currentMessage.trim() || loading) return;
    if (!auth.currentUser) return alert("Login required");

    setLoading(true);

    let chat = selectedChat;

    try {
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

      await addDoc(msgRef, {
        text: currentMessage,
        sender: "user",
        createdAt: new Date()
      });

      const userInput = currentMessage;
      setCurrentMessage("");

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: userInput })
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();

      await addDoc(msgRef, {
        text: data.reply || "No response",
        sender: "ai",
        createdAt: new Date()
      });

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
      console.error(err);

      const msgRef = collection(
        db,
        "users",
        auth.currentUser.uid,
        "chats",
        chat?.id,
        "messages"
      );

      await addDoc(msgRef, {
        text: "⚠️ Server error. Try again.",
        sender: "ai",
        createdAt: new Date()
      });
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-black">

      {/* Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed z-50 inset-y-0 left-0 w-64 bg-black transform ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } transition md:relative md:translate-x-0`}
      >
        <Sidebar
          chats={chats}
          onSelectChat={(chat) => {
            setSelectedChat(chat);
            setShowSidebar(false);
          }}
          onNewChat={handleNewChat}
        />
      </div>

      {/* MAIN */}
      <div className="flex flex-col flex-1">

        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 text-white">

          <div className="flex items-center gap-3">

            {/* Menu */}
            <button
              className="md:hidden"
              onClick={() => setShowSidebar(true)}
            >
              <FaBars />
            </button>

            {/* ✅ MOBILE LOGO */}
            <div className="flex items-center gap-2 md:hidden">
              <img src={Logo} alt="NovaAI" className="h-15 w-20" />
              
            </div>

            {/* ✅ DESKTOP TITLE */}
            <span className="hidden md:block font-semibold">
              {selectedChat?.name || "Select Chat"}
            </span>

          </div>
        </div>

        {/* CHAT */}
        <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-4">

          {!selectedChat && (
            <div className="flex items-center justify-center h-full text-gray-500">
              Start a new conversation 🚀
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`
                  max-w-[85%] md:max-w-[70%]
                  px-4 py-2 rounded-2xl text-sm
                  whitespace-pre-wrap break-words
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

        {/* INPUT */}
        <div className="sticky bottom-0 p-3 bg-black border-t border-gray-800 flex gap-2">
          <input
            ref={inputRef}
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full bg-zinc-900 text-white outline-none text-sm md:text-base"
          />

          <button
            onClick={handleSend}
            disabled={loading}
            className="p-3 bg-green-500 rounded-full active:scale-95 disabled:opacity-50"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;