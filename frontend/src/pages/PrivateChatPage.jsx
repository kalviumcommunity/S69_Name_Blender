import React, { useState, useEffect, useRef } from "react";
import { Send, Edit2, LogOut, Moon, Sun, ArrowLeft, Home } from "lucide-react";
import io from "socket.io-client";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";

const socket = io(import.meta.env.VITE_API_URL || "https://s69-name-blender-4.onrender.com", {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
});

function PrivateChatPage() {
  const { recipientId } = useParams();
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem("darkMode")) ?? true);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const touchTimeoutRef = useRef(null);
  const menuTimeoutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      setError("Please log in to access private chat.");
      setLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      socket.connect();
      socket.emit("join", parsedUser.name, () => setIsOnline(true));

      axios
        .get(`${import.meta.env.VITE_API_URL}/api/private-messages/${parsedUser.name}/${recipientId}`)
        .then((response) => {
          setMessages(Array.isArray(response.data) ? response.data : []);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load messages.");
          setMessages([]);
          setLoading(false);
        });

      socket.on("connect_error", () => setIsOnline(false));
      socket.on("connect", () => {
        setIsOnline(true);
        socket.emit("join", parsedUser.name);
      });
      socket.on("disconnect", () => setIsOnline(false));
    } catch {
      setError("Invalid user data. Please log in again.");
      setLoading(false);
    }

    return () => {
      socket.disconnect();
      setIsOnline(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
      if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    };
  }, [recipientId]);

  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      if (
        msg.isPrivate &&
        ((msg.senderId === user?.name && msg.recipientId === recipientId) ||
         (msg.senderId === recipientId && msg.recipientId === user?.name)) &&
        !messages.some(m => m._id === msg._id)
      ) {
        setMessages((prev) => [...prev, msg]);
        setTyping(false);
      }
    };

    const handleTyping = ({ senderId, recipientId: eventRecipientId }) => {
      // Show typing indicator if the sender is the other user in the private chat
      // and the recipient of the event is the current user
      if (senderId === recipientId && eventRecipientId === user?.name) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        setTyping(true);
        typingTimeoutRef.current = setTimeout(() => setTyping(false), 2000);
      }
    };

    const handleStopTyping = ({ senderId, recipientId: eventRecipientId }) => {
      // Clear typing indicator if the sender is the other user in the private chat
      // and the recipient of the event is the current user
      if (senderId === recipientId && eventRecipientId === user?.name) {
        setTyping(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      }
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter(msg => msg._id !== messageId));
      setMenuOpen(null);
    };

    const handleMessageEdited = ({ messageId, newText }) => {
      setMessages((prev) => prev.map(msg => msg._id === messageId ? { ...msg, text: newText } : msg));
    };

    const handleMessageSeen = ({ messageId, seenAt }) => {
      setMessages((prev) => prev.map(msg => msg._id === messageId ? { ...msg, seenAt } : msg));
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("messageEdited", handleMessageEdited);
    socket.on("messageSeen", handleMessageSeen);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("messageEdited", handleMessageEdited);
      socket.off("messageSeen", handleMessageSeen);
    };
  }, [recipientId, user?.name]);

  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.isPrivate && msg.recipientId === user?.name && msg.senderId === recipientId && !msg.seenAt) {
        socket.emit("markMessageSeen", { messageId: msg._id, recipientId: user.name });
      }
    });
  }, [messages, user?.name, recipientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!user || !message.trim()) return;
    const newMessage = {
      senderId: user.name,
      recipientId,
      text: message.trim(),
      isPrivate: true,
      replyTo: replyTo?._id,
    };
    socket.emit("sendPrivateMessage", newMessage);
    socket.emit("stopTyping", { senderId: user.name, recipientId });
    setMessage("");
    setReplyTo(null);
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (e.target.value.trim()) {
      socket.emit("typing", { senderId: user.name, recipientId });
    } else {
      socket.emit("stopTyping", { senderId: user.name, recipientId });
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

  if (error) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${darkMode ? "bg-gradient-to-br from-gray-900 via-black to-purple-950" : "bg-gradient-to-br from-white via-gray-100 to-purple-100"}`}>
        <div className={`p-6 rounded-2xl shadow-xl max-w-md text-center ${darkMode ? "bg-gray-900/30 border-gray-700" : "bg-gray-200/80 border-gray-300"}`}>
          <p className={darkMode ? "text-red-300" : "text-red-500"}>{error}</p>
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
        <div className="fixed top-4 left-6 z-20 flex items-center gap-2">
          <button
            onClick={() => navigate("/ChatPage")}
            className={`p-2 rounded-full ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-blue-200 hover:bg-blue-300 text-gray-900"}`}
            data-tooltip-id="back-tooltip"
            data-tooltip-content="Back to Global Chat"
          >
            <ArrowLeft size={16} />
          </button>
          <Tooltip id="back-tooltip" />
          <span className={`text-lg font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            🔒<span className={`${darkMode ? "text-purple-300" : "text-purple-600"}`}>{recipientId}</span>
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
        <h3 className={`text-3xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>🔒 Private Chat with {recipientId}</h3>
        {!user ? (
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
        ) : (
          <>
            <div className="flex-1 overflow-y-auto mb-4 p-4 rounded-lg flex flex-col gap-2">
              {loading ? (
                <p className={`text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Loading messages...</p>
              ) : messages.length === 0 ? (
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
                          {msg.replyTo && (
                            <div className={`text-xs italic mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"} border-l-2 pl-2 ${darkMode ? "border-gray-500" : "border-gray-400"}`}>
                              Replying to: {messages.find(m => m._id === msg.replyTo)?.text || "Deleted Message"}
                            </div>
                          )}
                          <span className="text-sm">{msg.text}</span>
                          <div className={`text-[10px] mt-0.5 ${msg.senderId === user.name ? "text-right" : "text-left"} ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {formatTimestamp(msg.timestamp)}
                            {msg.senderId === user.name && (
                              <span className="ml-1">
                                {msg.seenAt ? <span className="text-bold-blue-400">✓✓</span> : <span className="text-bold-gray-400">✓</span>}
                              </span>
                            )}
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
              {typing && (
                <div className={`text-sm italic animate-pulse ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {recipientId} is typing...
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
      </div>

      {error && (
        <div className={`fixed top-20 right-6 p-4 rounded-lg shadow-lg max-w-sm ${darkMode ? "bg-red-800 text-red-300 border-red-700" : "bg-red-100 text-red-700 border-red-300"} border animate-slide-in`}>
          <p>{error}</p>
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

export default PrivateChatPage;
