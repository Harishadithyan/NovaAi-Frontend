import React, { useEffect, useState } from "react";
import {
  FaPlus,
  FaUserCircle,
  FaChevronLeft,
  FaRegCommentDots,
  FaChevronRight,
  FaSignOutAlt
} from "react-icons/fa";
import logo from "../assets/Sidebar.png";

// Firebase
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ chats = [], onSelectChat, onNewChat }) => {
  const [isShrinkView, setIsShrinkView] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userPhoto, setUserPhoto] = useState(null);

  const navigate = useNavigate();

  // 📱 Responsive shrink
  useEffect(() => {
    const handleResize = () => {
      setIsShrinkView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔥 Fetch user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const ref = doc(db, "users", user.uid);
          const snap = await getDoc(ref);

          if (snap.exists()) {
            const data = snap.data();
            setUserName(data.name || "User");
            setUserPhoto(data.photo || user.photoURL || null);
          } else {
            // fallback for Google users
            setUserName(user.displayName || "User");
            setUserPhoto(user.photoURL || null);
          }
        } catch (err) {
          console.error("User fetch error:", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 🚪 Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleSidebarView = () => setIsShrinkView(!isShrinkView);

  return (
    <div
      className={`flex flex-col bg-zinc-900 text-white h-screen transition-all duration-300 ${
        isShrinkView ? "w-20" : "w-64"
      }`}
    >
      {/* 🔝 Top */}
      <div className="flex items-center justify-between p-2 border-b border-gray-800">
        <img
          src={logo}
          alt="Nova AI"
          className={`object-contain drop-shadow-[0_0_8px_#08CB00] transition-all duration-300 ${
            isShrinkView ? "w-10 h-10 mb-2" : "w-[110px] mt-2"
          }`}
        />
        <button
          className="text-green-500 hover:bg-gray-800 p-2 rounded transition"
          onClick={handleSidebarView}
        >
          {isShrinkView ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      {/* 📂 Middle */}
      <div className="flex-1 flex flex-col overflow-y-auto p-2">
        
        {/* ➕ New Chat */}
        <div className="mb-4 flex justify-center">
          {isShrinkView ? (
            <button
              onClick={onNewChat}
              className="p-2 bg-green-500 rounded-full hover:bg-green-600 transition"
            >
              <FaPlus />
            </button>
          ) : (
            <button
              onClick={onNewChat}
              className="flex items-center gap-2 p-2 bg-green-500 rounded hover:bg-green-600 transition w-full justify-center"
            >
              <FaPlus /> New Chat
            </button>
          )}
        </div>

        {/* 🧠 Chat History */}
        <ul className="flex-1 flex flex-col gap-2">
          {chats.length === 0 && !isShrinkView && (
            <p className="text-gray-500 text-sm text-center mt-4">
              No chats yet
            </p>
          )}

          {chats.map((chat, index) => (
            <li
              key={chat.id || index}
              onClick={() => onSelectChat(chat)}
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 cursor-pointer"
            >
              <FaRegCommentDots className="text-gray-400" />
              {!isShrinkView && (
                <span className="truncate">
  {chat.name?.split(" ").slice(0, 4).join(" ")}
</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* 👤 Bottom: Profile + Logout */}
      <div className="p-3 border-t border-gray-800 flex flex-col gap-2">

        {/* Profile */}
        <div className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded cursor-pointer">
          
          <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
            {userPhoto ? (
              <img
                src={userPhoto}
                alt="profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUserCircle size={24} />
            )}
          </div>

          {!isShrinkView && (
            <span className="font-medium truncate">{userName}</span>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 hover:bg-red-600 p-2 rounded transition justify-center"
        >
          <FaSignOutAlt />
          {!isShrinkView && <span>Logout</span>}
        </button>

      </div>
    </div>
  );
};

export default Sidebar;