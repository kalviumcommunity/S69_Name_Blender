import React, { useState, useEffect, useRef } from "react";
import { Send, Edit2, LogOut, Moon, Sun, Home, Search } from "lucide-react";
import io from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";

const socket = io(import.meta.env.VITE_API_URL || "https://s69-name-blender-4.onrender.com", {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
});

function ChatPage() {
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem("darkMode")) ?? true);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [notification, setNotification] = useState(null);
  const [privateChatPrompt, setPrivateChatPrompt] = useState(null);
  const [privateChatNotification, setPrivateChatNotification] = useState(null);
  const [privateMessageNotification, setPrivateMessageNotification] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const messagesEndRef = useRef(null);
  const touchTimeoutRef = useRef(null);
  const menuTimeoutRef = useRef(null);
  const typingTimeoutsRef = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const initialize = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setNotification({ message: "Please log in.", type: "error" });
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        socket.connect();
        socket.emit("join", parsedUser.name);

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages`);
        setMessages(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setNotification({ message: "Failed to load messages.", type: "error" });
      }
    };

    initialize();

    const handleReceiveMessage = (msg) => {
      if (!msg.isPrivate && !messages.some(m => m._id === msg._id)) {
        setMessages((prev) => [...prev, msg]);
        setTypingUsers((prev) => prev.filter(u => u !== msg.senderId));
      }
    };

    const handleUserList = ({ users }) => setUsers(users.filter(u => u !== user?.name));

    const handleTyping = ({ senderId, recipientId }) => {
      if (recipientId) return;
      if (senderId !== user?.name) {
        setTypingUsers((prev) => {
          if (!prev.includes(senderId)) {
            return [...prev, senderId];
          }
          return prev;
        });

        if (typingTimeoutsRef.current[senderId]) {
          clearTimeout(typingTimeoutsRef.current[senderId]);
        }

        typingTimeoutsRef.current[senderId] = setTimeout(() => {
          setTypingUsers((prev) => prev.filter(u => u !== senderId));
          delete typingTimeoutsRef.current[senderId];
        }, 2000);
      }
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter(msg => msg._id !== messageId));
      setMenuOpen(null);
    };

    const handleMessageEdited = ({ messageId, newText }) => {
      setMessages((prev) => prev.map(msg => msg._id === messageId ? { ...msg, text: newText } : msg));
    };

    const handlePrivateChatRequest = ({ senderId, recipientId }) => {
      if (recipientId === user?.name) setPrivateChatPrompt({ senderId, recipientId });
    };

    const handlePrivateChatAccepted = ({ senderId, recipientId }) => {
      if (senderId === user?.name) {
        navigate(`/private-chat/${recipientId}`);
        setPrivateChatPrompt(null);
      }
    };

    const handlePrivateChatRejected = ({ senderId, recipientId }) => {
      if (senderId === user?.name) {
        setNotification({ message: `${recipientId} rejected your request.`, type: "error" });
        setTimeout(() => setNotification(null), 5000);
      }
    };

    const handleNotifyPrivateChat = ({ senderId, recipientId }) => {
      if (recipientId === user?.name) {
        setPrivateChatNotification({ senderId, recipientId });
      }
    };

    const handlePrivateMessageNotification = ({ senderId, recipientId, messageId }) => {
      if (recipientId === user?.name) {
        setPrivateMessageNotification({ senderId, recipientId, messageId });
      }
    };

    socket.on("connect", () => setIsOnline(true));
    socket.on("connect_error", () => setIsOnline(false));
    socket.on("disconnect", () => setIsOnline(false));
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("userList", handleUserList);
    socket.on("typing", handleTyping);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("messageEdited", handleMessageEdited);
    socket.on("privateChatRequest", handlePrivateChatRequest);
    socket.on("privateChatAccepted", handlePrivateChatAccepted);
    socket.on("privateChatRejected", handlePrivateChatRejected);
    socket.on("notifyPrivateChat", handleNotifyPrivateChat);
    socket.on("privateMessageNotification", handlePrivateMessageNotification);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("userList", handleUserList);
      socket.off("typing", handleTyping);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("messageEdited", handleMessageEdited);
      socket.off("privateChatRequest", handlePrivateChatRequest);
      socket.off("privateChatAccepted", handlePrivateChatAccepted);
      socket.off("privateChatRejected", handlePrivateChatRejected);
      socket.off("notifyPrivateChat", handleNotifyPrivateChat);
      socket.off("privateMessageNotification", handlePrivateMessageNotification);
      socket.disconnect();
      if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
      if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
      Object.values(typingTimeoutsRef.current).forEach(clearTimeout);
      typingTimeoutsRef.current = {};
    };
  }, [user?.name, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!user?.name || !message.trim()) return;
    const newMessage = {
      senderId: user.name,
      text: message.trim(),
      timestamp: Date.now(),
      replyTo: replyTo?._id || null,
    };
    socket.emit("sendMessage", newMessage);
    socket.emit("stopTyping", { senderId: user.name });
    setMessage("");
    setReplyTo(null);
  };

  const startPrivateChat = (recipientId) => {
    if (!user?.name || recipientId === user.name) return;
    socket.emit("privateChatRequest", { senderId: user.name, recipientId });
  };

  const handleAcceptPrivateChat = () => {
    socket.emit("acceptPrivateChat", privateChatPrompt);
    setPrivateChatPrompt(null);
  };

  const handleRejectPrivateChat = () => {
    socket.emit("rejectPrivateChat", privateChatPrompt);
    setPrivateChatPrompt(null);
  };

  const handleNavigateToPrivateChat = (notificationType) => {
    if (notificationType === "privateChat" && privateChatNotification) {
      navigate(`/private-chat/${privateChatNotification.senderId}`);
      setPrivateChatNotification(null);
    } else if (notificationType === "privateMessage" && privateMessageNotification) {
      navigate(`/private-chat/${privateMessageNotification.senderId}`);
      setPrivateMessageNotification(null);
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (e.target.value.trim()) {
      socket.emit("typing", { senderId: user.name });
    } else {
      socket.emit("stopTyping", { senderId: user.name });
    }
  };

  const handleDeleteMessage = (msgId) => {
    socket.emit("deleteMessage", { messageId: msgId, senderId: user.name });
    setMenuOpen(null);
  };

  const handleEditMessage = (msgId, newText) => {
    if (newText?.trim()) {
      socket.emit("editMessage", { messageId: msgId, newText, senderId: user.name });
    }
    setMenuOpen(null);
  };

  const handleReply = (msg) => {
    setReplyTo(msg);
    setMenuOpen(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    socket.disconnect();
    setUser(null);
    setMessages([]);
    setUsers([]);
    setIsOnline(false);
    navigate("/login");
  };

  const toggleMenu = (msgId) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setMenuOpen(msgId);
    menuTimeoutRef.current = setTimeout(() => setMenuOpen(null), 3000);
  };

  const handleTouchStart = (msgId) => {
    touchTimeoutRef.current = setTimeout(() => toggleMenu(msgId), 500);
  };

  const handleTouchEnd = () => {
    if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
  };

  const handleClickOutside = () => {
    if (menuOpen) {
      setMenuOpen(null);
      if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp || isNaN(new Date(timestamp).getTime())) return "";
    return new Date(timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true });
  };

  const formatDate = (timestamp) => {
    if (!timestamp || isNaN(new Date(timestamp).getTime())) return "";
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const groupedMessages = () => {
    const groups = [];
    let currentDate = null;

    messages.forEach((msg) => {
      const messageDate = formatDate(msg.timestamp);
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        groups.push({ date: messageDate, messages: [] });
      }
      groups[groups.length - 1].messages.push(msg);
    });

    return groups;
  };

  if (notification?.message === "Please log in.") {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${darkMode ? "bg-gradient-to-br from-gray-900 via-black to-purple-950" : "bg-gradient-to-br from-white via-gray-100 to-purple-100"}`}>
        <div className={`p-6 rounded-2xl shadow-xl max-w-md text-center ${darkMode ? "bg-gray-900/30 border-gray-700" : "bg-gray-200/80 border-gray-300"}`}>
          <p className={darkMode ? "text-red-300" : "text-red-500"}>Please log in to chat.</p>
          <button
            onClick={() => navigate("/login")}
            className={`mt-4 px-4 py-2 rounded-full ${darkMode ? "bg-purple-700 hover:bg-purple-600 text-white" : "bg-purple-500 hover:bg-purple-400 text-white"}`}
            data-tooltip-id="login-tooltip"
            data-tooltip-content="Go to Login Page"
          >
            Go to Login
          </button>
          <Tooltip id="login-tooltip" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-6 ${darkMode ? "bg-gradient-to-br from-gray-900 via-black to-purple-950" : "bg-gradient-to-br from-white via-gray-100 to-purple-100"} transition-all duration-500 relative overflow-hidden`}
      onClick={handleClickOutside}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className={`w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse absolute ${darkMode ? "top-10 left-10" : "top-20 right-20"}`}></div>
        <div className={`w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse absolute ${darkMode ? "bottom-20 right-20" : "bottom-10 left-10"} delay-1000`}></div>
      </div>

      {user && (
        <div className="fixed top-4 left-6 z-20 flex items-center gap-4">
          <span className={`text-lg font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Welcome, <span className={`${darkMode ? "text-purple-300" : "text-purple-600"}`}>{user.name}</span>
          </span>
          <span className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-400" : "bg-red-400"}`}></span>
        </div>
      )}

      <div className="fixed top-4 right-10 z-20 flex gap-4">
        <button
          onClick={() => navigate("/homePage")}
          className={`p-2 rounded-full ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-blue-200 hover:bg-blue-300 text-gray-900"}`}
          data-tooltip-id="home-tooltip"
          data-tooltip-content="Go to Homepage"
        >
          <Home size={16} />
        </button>
        <Tooltip id="home-tooltip" />
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-full ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-yellow-200 hover:bg-yellow-300 text-gray-900"}`}
          data-tooltip-id="mode-tooltip"
          data-tooltip-content={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <Tooltip id="mode-tooltip" />
        {user && (
          <button
            onClick={handleLogout}
            className={`p-2 rounded-full ${darkMode ? "bg-red-600 hover:bg-red-500" : "bg-red-400 hover:bg-red-300"}`}
            data-tooltip-id="logout-tooltip"
            data-tooltip-content="Log Out"
          >
            <LogOut size={16} className="text-white" />
          </button>
        )}
        <Tooltip id="logout-tooltip" />
      </div>

      <div className={`p-6 rounded-2xl shadow-xl w-full max-w-2xl backdrop-blur-md ${darkMode ? "bg-gray-900/30 border-gray-700" : "bg-gray-200/80 border-gray-300"} mt-16 flex flex-col h-[80vh]`}>
        {user && (
          <>
            <h1 className={`text-3xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>🌎Global Chat</h1>
            <div className={`mb-4 text-sm font-medium ${darkMode ? "text-purple-300" : "text-purple-600"}`}>
              Click on online users to chat privately with them!
            </div>
            <div className="mb-4">
              <p className={`text-sm mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Online Users ({users.length})</p>
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full p-2 pl-8 rounded-lg border ${darkMode ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
                <Search size={16} className={`absolute left-2 top-1/2 transform -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
              </div>
              <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                {users.filter(u => u.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
                  <span
                    key={u}
                    className={`text-sm px-3 py-1 rounded-full cursor-pointer ${darkMode ? "bg-purple-600/30 text-purple-300 hover:bg-purple-500" : "bg-purple-200/50 text-purple-600 hover:bg-purple-300"}`}
                    onClick={() => startPrivateChat(u)}
                    data-tooltip-id={`user-tooltip-${u}`}
                    data-tooltip-content="Chat Privately"
                  >
                    {u}
                    <Tooltip id={`user-tooltip-${u}`} />
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto mb-4 p-4 rounded-lg flex flex-col gap-2">
              {messages.length === 0 ? (
                <p className={`text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>No messages yet. Start the conversation!</p>
              ) : (
                groupedMessages().map((group, groupIndex) => (
                  <div key={groupIndex} className="mb-4">
                    <div className={`flex items-center justify-center my-2 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      <div className={`flex-1 h-px ${darkMode ? "bg-gray-600" : "bg-gray-300"}`}></div>
                      <span className="px-3">{group.date}</span>
                      <div className={`flex-1 h-px ${darkMode ? "bg-gray-600" : "bg-gray-300"}`}></div>
                    </div>
                    {group.messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex relative ${msg.senderId === user.name ? "justify-end" : "justify-start"} mb-2 group`}
                        onContextMenu={(e) => { e.preventDefault(); toggleMenu(msg._id); }}
                        onTouchStart={() => handleTouchStart(msg._id)}
                        onTouchEnd={handleTouchEnd}
                      >
                        <div className={`max-w-[65%] p-2.5 rounded-xl overflow-wrap break-word word-break break-all white-space normal overflow-hidden ${msg.senderId === user.name ? (darkMode ? "bg-purple-600 text-white" : "bg-purple-300 text-gray-900") : (darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-300 text-gray-700")}`}>
                          <div className={`text-xs font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"} mb-1`}>{msg.senderId}</div>
                          {msg.replyTo && (
                            <div className={`text-xs italic mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"} border-l-2 pl-2 ${darkMode ? "border-gray-500" : "border-gray-400"}`}>
                              Replying to: {messages.find(m => m._id === msg.replyTo)?.text || "Deleted Message"}
                            </div>
                          )}
                          <span className="text-sm">{msg.text}</span>
                          <div className={`text-[10px] mt-0.5 ${msg.senderId === user.name ? "text-right" : "text-left"} ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {formatTimestamp(msg.timestamp)}
                          </div>
                          <div className={`absolute z-10 mt-2 w-32 rounded-lg shadow-lg ${msg.senderId === user.name ? "right-0" : "left-0"} ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"} border ${darkMode ? "border-gray-700" : "border-gray-300"} transition-opacity duration-200 ${menuOpen === msg._id ? "opacity-100 visible" : "opacity-0 invisible"}`}>
                            {msg.senderId === user.name && (
                              <>
                                <button
                                  onClick={() => handleEditMessage(msg._id, prompt("Edit message:", msg.text))}
                                  className={`w-full text-left px-3 py-1.5 text-sm hover:${darkMode ? "bg-purple-700" : "bg-purple-200"} flex items-center gap-2`}
                                  data-tooltip-id={`edit-tooltip-${msg._id}`}
                                  data-tooltip-content="Edit Message"
                                >
                                  <Edit2 size={12} /> Edit
                                </button>
                                <Tooltip id={`edit-tooltip-${msg._id}`} />
                                <button
                                  onClick={() => handleDeleteMessage(msg._id)}
                                  className={`w-full text-left px-3 py-1.5 text-sm hover:${darkMode ? "bg-red-700" : "bg-red-200"} flex items-center gap-2`}
                                  data-tooltip-id={`delete-tooltip-${msg._id}`}
                                  data-tooltip-content="Delete Message"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                  </svg>
                                  Delete
                                </button>
                                <Tooltip id={`delete-tooltip-${msg._id}`} />
                              </>
                            )}
                            <button
                              onClick={() => handleReply(msg)}
                              className={`w-full text-left px-3 py-1.5 text-sm hover:${darkMode ? "bg-blue-700" : "bg-blue-200"} flex items-center gap-2`}
                              data-tooltip-id={`reply-tooltip-${msg._id}`}
                              data-tooltip-content="Reply to Message"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                              </svg>
                              Reply
                            </button>
                            <Tooltip id={`reply-tooltip-${msg._id}`} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
              {typingUsers.length > 0 && (
                <div className={`text-sm italic animate-pulse ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {typingUsers.join(", ")} {typingUsers.length > 1 ? "are" : "is"} typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2 mt-auto">
              <textarea
                placeholder={replyTo ? `Replying to ${replyTo.senderId}: ${replyTo.text.slice(0, 20)}...` : "Type a message..."}
                value={message}
                onChange={handleTyping}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className={`flex-1 p-3 rounded-lg border resize-none min-h-[48px] max-h-[120px] overflow-y-auto ${darkMode ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                disabled={!user}
              />
              <button
                onClick={handleSendMessage}
                className={`p-3 rounded-full bg-purple-700 text-white hover:bg-purple-500 ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={!user}
                data-tooltip-id="send-tooltip"
                data-tooltip-content="Send Message"
              >
                <Send size={16} />
              </button>
              <Tooltip id="send-tooltip" />
            </div>
          </>
        )}
        {!user && (
          <div className="flex flex-col items-center gap-4">
            <p className={`text-md mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Please log in to chat.</p>
            <button
              onClick={() => navigate("/login")}
              className={`px-4 py-2 rounded-full ${darkMode ? "bg-purple-700 hover:bg-purple-600 text-white" : "bg-purple-500 hover:bg-purple-400 text-white"}`}
              data-tooltip-id="login-tooltip"
              data-tooltip-content="Go to Login Page"
            >
              Go to Login
            </button>
            <Tooltip id="login-tooltip" />
          </div>
        )}
      </div>

      {notification && (
        <div className={`fixed top-20 right-6 p-4 rounded-lg shadow-lg max-w-sm ${notification.type === "error" ? (darkMode ? "bg-red-800 text-red-300 border-red-700" : "bg-red-100 text-red-700 border-red-300") : (darkMode ? "bg-gray-800 text-gray-300 border-gray-700" : "bg-white text-gray-700 border-gray-300")} border animate-slide-in`}>
          <p>{notification.message}</p>
        </div>
      )}

      {privateChatPrompt && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 ${darkMode ? "bg-black/70" : "bg-gray-900/50"}`}>
          <div className={`p-6 rounded-2xl shadow-xl max-w-md text-center ${darkMode ? "bg-gray-900/90 border-gray-700" : "bg-gray-200/90 border-gray-300"}`}>
            <p className={`text-lg mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              {privateChatPrompt.senderId} wants to start a private chat. Accept?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleAcceptPrivateChat}
                className={`px-4 py-2 rounded-full ${darkMode ? "bg-green-700 hover:bg-green-600 text-white" : "bg-green-500 hover:bg-green-400 text-white"}`}
                data-tooltip-id="accept-tooltip"
                data-tooltip-content="Accept Private Chat"
              >
                Accept
              </button>
              <Tooltip id="accept-tooltip" />
              <button
                onClick={handleRejectPrivateChat}
                className={`px-4 py-2 rounded-full ${darkMode ? "bg-red-700 hover:bg-red-600 text-white" : "bg-red-500 hover:bg-red-400 text-white"}`}
                data-tooltip-id="reject-tooltip"
                data-tooltip-content="Reject Private Chat"
              >
                Reject
              </button>
              <Tooltip id="reject-tooltip" />
            </div>
          </div>
        </div>
      )}

      {privateChatNotification && (
        <div className={`fixed top-20 right-6 p-4 rounded-lg shadow-lg max-w-sm ${darkMode ? "bg-gray-800 text-gray-300 border-gray-700" : "bg-white text-gray-700 border-gray-300"} border animate-slide-in`}>
          <p>{privateChatNotification.senderId} is in your private chat!</p>
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => handleNavigateToPrivateChat("privateChat")}
              className={`px-3 py-1 rounded-full ${darkMode ? "bg-green-700 hover:bg-green-600 text-white" : "bg-green-500 hover:bg-green-400 text-white"}`}
            >
              Go to Chat
            </button>
            <button
              onClick={() => setPrivateChatNotification(null)}
              className={`px-3 py-1 rounded-full ${darkMode ? "bg-gray-600 hover:bg-gray-500 text-white" : "bg-gray-300 hover:bg-gray-400 text-gray-900"}`}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {privateMessageNotification && (
        <div className={`fixed top-20 right-6 p-4 rounded-lg shadow-lg max-w-sm ${darkMode ? "bg-gray-800 text-gray-300 border-gray-700" : "bg-white text-gray-700 border-gray-300"} border animate-slide-in`}>
          <p>You got a message from {privateMessageNotification.senderId}!</p>
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => handleNavigateToPrivateChat("privateMessage")}
              className={`px-3 py-1 rounded-full ${darkMode ? "bg-green-700 hover:bg-green-600 text-white" : "bg-green-500 hover:bg-green-400 text-white"}`}
            >
              Go to Chat
            </button>
            <button
              onClick={() => setPrivateMessageNotification(null)}
              className={`px-3 py-1 rounded-full ${darkMode ? "bg-gray-600 hover:bg-gray-500 text-white" : "bg-gray-300 hover:bg-gray-400 text-gray-900"}`}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}

export default ChatPage;



