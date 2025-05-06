// import React, { useState, useEffect, useRef } from "react";
// import { Send, Edit2, LogOut, MoreVertical, Moon, Sun, ArrowLeft, Home } from "lucide-react";
// import io from "socket.io-client";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";
// import { Tooltip } from "react-tooltip";

// console.log("Socket.IO URL:", import.meta.env.VITE_API_URL);
// const socket = io(import.meta.env.VITE_API_URL || "https://s69-name-blender-4.onrender.com", {
//   autoConnect: false,
//   reconnection: true,
//   reconnectionAttempts: 5,
// });

// function PrivateChatPage() {
//   const { recipientId } = useParams();
//   const [darkMode, setDarkMode] = useState(() => {
//     const savedMode = localStorage.getItem("darkMode");
//     return savedMode !== null ? JSON.parse(savedMode) : true;
//   });
//   const [user, setUser] = useState(null);
//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [typing, setTyping] = useState(false);
//   const [isOnline, setIsOnline] = useState(false);
//   const [menuOpen, setMenuOpen] = useState(null);
//   const [replyTo, setReplyTo] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const messagesEndRef = useRef(null);
//   const typingTimeoutRef = useRef(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     localStorage.setItem("darkMode", JSON.stringify(darkMode));
//   }, [darkMode]);

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     if (!storedUser) {
//       setError("Please log in to access private chat.");
//       setLoading(false);
//       return;
//     }

//     try {
//       const parsedUser = JSON.parse(storedUser);
//       setUser(parsedUser);
//       socket.connect();
//       socket.emit("join", parsedUser.name, (response) => {
//         console.log("Join response:", response);
//         setIsOnline(true);
//       });

//       axios
//         .get(
//           `${(import.meta.env.VITE_API_URL || "https://s69-name-blender-4.onrender.com").replace(/\/$/, "")}/api/private-messages/${parsedUser.name}/${recipientId}`
//         )
//         .then((response) => {
//           console.log("Fetched private messages:", response.data);
//           setMessages(Array.isArray(response.data) ? response.data : []);
//           setLoading(false);
//         })
//         .catch((err) => {
//           console.error("Error fetching private messages:", err.response ? err.response.data : err.message);
//           setError("Failed to load messages. Please try again.");
//           setMessages([]);
//           setLoading(false);
//         });

//       socket.on("connect_error", (err) => {
//         console.error("Socket connection error:", err.message);
//         setIsOnline(false);
//         setError("Connection lost. Reconnecting...");
//       });

//       socket.on("connect", () => {
//         console.log("Socket connected:", parsedUser.name);
//         setIsOnline(true);
//         socket.emit("join", parsedUser.name);
//       });

//       socket.on("disconnect", () => {
//         console.log("Socket disconnected:", parsedUser.name);
//         setIsOnline(false);
//       });
//     } catch (error) {
//       console.error("Failed to parse user from localStorage:", error);
//       setError("Invalid user data. Please log in again.");
//       setLoading(false);
//     }

//     return () => {
//       socket.disconnect();
//       setIsOnline(false);
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }
//     };
//   }, [recipientId]);

//   useEffect(() => {
//     const handleReceiveMessage = (msg) => {
//       console.log("Received private message:", msg);
//       if (
//         msg.isPrivate &&
//         ((msg.senderId === user?.name && msg.recipientId === recipientId) ||
//          (msg.senderId === recipientId && msg.recipientId === user?.name))
//       ) {
//         setMessages((prev) => {
//           if (!prev.some((m) => m._id === msg._id)) {
//             return [...prev, msg];
//           }
//           return prev;
//         });
//         setTyping(false);
//       }
//     };

//     const handleTyping = ({ senderId }) => {
//       console.log("Typing event from:", senderId);
//       if (senderId === recipientId && senderId !== user?.name) {
//         if (typingTimeoutRef.current) {
//           clearTimeout(typingTimeoutRef.current);
//         }
//         setTyping(true);
//         typingTimeoutRef.current = setTimeout(() => {
//           setTyping(false);
//         }, 2000);
//       }
//     };

//     const handleStopTyping = ({ senderId }) => {
//       console.log("Stop typing event from:", senderId);
//       if (senderId === recipientId && senderId !== user?.name) {
//         if (typingTimeoutRef.current) {
//           clearTimeout(typingTimeoutRef.current);
//         }
//         setTyping(false);
//       }
//     };

//     const handleMessageDeleted = ({ messageId }) => {
//       console.log("Message deleted:", messageId);
//       setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
//       setMenuOpen(null);
//     };

//     const handleMessageEdited = ({ messageId, newText }) => {
//       console.log("Message edited:", messageId, newText);
//       setMessages((prev) =>
//         prev.map((msg) => (msg._id === messageId ? { ...msg, text: newText } : msg))
//       );
//     };

//     const handleMessageSeen = ({ messageId, seenAt }) => {
//       console.log("Message seen:", messageId, seenAt);
//       setMessages((prev) =>
//         prev.map((msg) =>
//           msg._id === messageId ? { ...msg, seenAt } : msg
//         )
//       );
//     };

//     socket.on("receiveMessage", handleReceiveMessage);
//     socket.on("typing", handleTyping);
//     socket.on("stopTyping", handleStopTyping);
//     socket.on("messageDeleted", handleMessageDeleted);
//     socket.on("messageEdited", handleMessageEdited);
//     socket.on("messageSeen", handleMessageSeen);

//     return () => {
//       socket.off("receiveMessage", handleReceiveMessage);
//       socket.off("typing", handleTyping);
//       socket.off("stopTyping", handleStopTyping);
//       socket.off("messageDeleted", handleMessageDeleted);
//       socket.off("messageEdited", handleMessageEdited);
//       socket.off("messageSeen", handleMessageSeen);
//     };
//   }, [recipientId, user?.name]);

//   useEffect(() => {
//     messages.forEach((msg) => {
//       if (
//         msg.isPrivate &&
//         msg.recipientId === user?.name &&
//         msg.senderId === recipientId &&
//         !msg.seenAt
//       ) {
//         socket.emit("markMessageSeen", { messageId: msg._id, recipientId: user.name });
//       }
//     });
//   }, [messages, user?.name, recipientId]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleSendMessage = () => {
//     if (!user || !message.trim()) return;
//     const newMessage = {
//       senderId: user.name,
//       recipientId,
//       text: message.trim(),
//       isPrivate: true,
//       replyTo: replyTo?._id,
//     };
//     console.log("Sending private message:", newMessage);
//     socket.emit("sendPrivateMessage", newMessage, (response) => {
//       console.log("Send response:", response);
//       if (response.status !== "success") {
//         setError("Failed to send message: " + response.message);
//       }
//     });
//     socket.emit("stopTyping", { senderId: user.name, recipientId });
//     setMessage("");
//     setReplyTo(null);
//   };

//   const handleTyping = (e) => {
//     setMessage(e.target.value);
//     if (e.target.value.trim()) {
//       socket.emit("typing", { senderId: user.name, recipientId });
//     } else {
//       socket.emit("stopTyping", { senderId: user.name, recipientId });
//     }
//   };

//   const handleDeleteMessage = (msgId) => {
//     socket.emit("deleteMessage", { messageId: msgId, senderId: user.name });
//     setMenuOpen(null);
//   };

//   const handleEditMessage = (msgId, newText) => {
//     if (newText) {
//       socket.emit("editMessage", { messageId: msgId, newText, senderId: user.name });
//     }
//     setMenuOpen(null);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("user");
//     socket.disconnect();
//     setUser(null);
//     setMessages([]);
//     setIsOnline(false);
//     navigate("/login");
//   };

//   const toggleMenu = (msgId) => {
//     setMenuOpen(menuOpen === msgId ? null : msgId);
//   };

//   const handleReply = (msg) => {
//     setReplyTo(msg);
//     setMenuOpen(null);
//   };

//   const formatTimestamp = (timestamp) => {
//     if (!timestamp || isNaN(new Date(timestamp).getTime())) return "Invalid Date";
//     return new Date(timestamp).toLocaleString("en-US", {
//       month: "numeric",
//       day: "numeric",
//       year: "numeric",
//       hour: "numeric",
//       minute: "numeric",
//       hour12: true,
//     }).replace(",", "");
//   };

//   const formatSeenStatus = (seenAt) => {
//     if (!seenAt || isNaN(new Date(seenAt).getTime())) return "";
//     const now = Date.now();
//     const diffMs = now - new Date(seenAt).getTime();
//     const diffMins = Math.floor(diffMs / 60000);
    
//     if (diffMins < 1) return "Seen just now";
//     if (diffMins === 1) return "Seen 1 min ago";
//     if (diffMins < 60) return `Seen ${diffMins} mins ago`;
//     const diffHours = Math.floor(diffMins / 60);
//     if (diffHours === 1) return "Seen 1 hour ago";
//     if (diffHours < 24) return `Seen ${diffHours} hours ago`;
//     const diffDays = Math.floor(diffHours / 24);
//     if (diffDays === 1) return "Seen 1 day ago";
//     return `Seen ${diffDays} days ago`;
//   };

//   if (error) {
//     return (
//       <div
//         className={`${
//           darkMode ? "bg-gradient-to-br from-gray-900 via-black to-purple-950" : "bg-gradient-to-br from-white via-gray-100 to-purple-100"
//         } min-h-screen flex flex-col items-center justify-center p-6`}
//       >
//         <div className={`p-6 rounded-2xl shadow-xl max-w-md text-center ${darkMode ? "bg-gray-900 bg-opacity-30 border border-gray-700" : "bg-gray-200 bg-opacity-80 border border-gray-300"}`}>
//           <p className={darkMode ? "text-red-300" : "text-red-500"}>{error}</p>
//           <button
//             onClick={() => navigate("/login")}
//             className={`mt-4 px-4 py-2 rounded-full ${darkMode ? "bg-purple-700 hover:bg-purple-600 text-white" : "bg-purple-500 hover:bg-purple-400 text-white"}`}
//             data-tooltip-id="login-tooltip"
//             data-tooltip-content="Go to Login Page"
//           >
//             Go to Login
//           </button>
//           <Tooltip id="login-tooltip" />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div
//       className={`${
//         darkMode ? "bg-gradient-to-br from-gray-900 via-black to-purple-950" : "bg-gradient-to-br from-white via-gray-100 to-purple-100"
//       } min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-500 relative overflow-hidden`}
//     >
//       <div className="absolute inset-0 pointer-events-none">
//         <div
//           className={`w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse absolute ${
//             darkMode ? "top-10 left-10" : "top-20 right-20"
//           }`}
//         ></div>
//         <div
//           className={`w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse absolute ${
//             darkMode ? "bottom-20 right-20" : "bottom-10 left-10"
//           } delay-1000`}
//         ></div>
//       </div>

//       {user && (
//         <div className="fixed top-4 left-6 z-20 flex items-center gap-2">
//           <button
//             onClick={() => navigate("/ChatPage")}
//             className={`p-2 rounded-full ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-blue-200 hover:bg-blue-300 text-gray-900"} transition-all`}
//             data-tooltip-id="back-tooltip"
//             data-tooltip-content="Back to Global Chat"
//           >
//             <ArrowLeft size={16} />
//           </button>
//           <Tooltip id="back-tooltip" />
//           <span className={`text-lg font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
//             Chatting with <span className={`${darkMode ? "animate-color-flow-dark hover:text-purple-300" : "animate-color-flow-light hover:text-purple-600"} transition`}>{recipientId}</span>
//           </span>
//           <span className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-400" : "bg-red-400"}`}></span>
//         </div>
//       )}

//       <div className="fixed top-4 right-10 z-20 flex gap-4">
//         <button
//           onClick={() => navigate("/homePage")}
//           className={`p-2 rounded-full ${
//             darkMode
//               ? "bg-gray-700 hover:bg-gray-600 text-white"
//               : "bg-blue-200 hover:bg-blue-300 text-gray-900"
//           } transition-all`}
//           data-tooltip-id="home-tooltip"
//           data-tooltip-content="Go to Homepage"
//         >
//           <Home size={16} />
//         </button>
//         <Tooltip id="home-tooltip" />
//         <button
//           onClick={() => setDarkMode(!darkMode)}
//           className={`p-2 rounded-full ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-yellow-200 hover:bg-yellow-300 text-gray-900"} transition-all`}
//           data-tooltip-id="mode-tooltip"
//           data-tooltip-content={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
//         >
//           {darkMode ? <Sun size={16} /> : <Moon size={16} />}
//         </button>
//         <Tooltip id="mode-tooltip" />
//         {user && (
//           <button
//             onClick={handleLogout}
//             className={`p-2 rounded-full ${darkMode ? "bg-red-600 hover:bg-red-500" : "bg-red-400 hover:bg-red-300"} transition-all`}
//             data-tooltip-id="logout-tooltip"
//             data-tooltip-content="Log Out"
//           >
//             <LogOut size={16} className="text-white" />
//           </button>
//         )}
//         <Tooltip id="logout-tooltip" />
//       </div>

//       <div
//         className={`p-6 rounded-2xl shadow-xl w-full max-w-2xl text-center transition-all duration-300 backdrop-blur-md ${
//           darkMode ? "bg-gray-900 bg-opacity-30 border border-gray-700" : "bg-gray-200 bg-opacity-80 border border-gray-300"
//         } relative z-10 mt-16`}
//       >
//         <h1 className={`text-3xl font-bold mb-4 animate-fade-in ${darkMode ? "text-white" : "text-gray-900"}`}>
//           💬 Private Chat with {recipientId}
//         </h1>
//         {!user ? (
//           <div className="flex flex-col items-center gap-4">
//             <p className={`text-md mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Please log in to chat.</p>
//             <button
//               onClick={() => navigate("/login")}
//               className={`px-4 py-2 rounded-full ${darkMode ? "bg-purple-700 hover:bg-purple-600 text-white" : "bg-purple-500 hover:bg-purple-400 text-white"} transition-all`}
//               data-tooltip-id="login-tooltip"
//               data-tooltip-content="Go to Login Page"
//             >
//               Go to Login
//             </button>
//             <Tooltip id="login-tooltip" />
//           </div>
//         ) : (
//           <>
//             <div className="max-h-64 overflow-y-auto mb-4 p-4 bg-opacity-50 rounded-lg flex flex-col gap-2">
//               {loading ? (
//                 <p className={darkMode ? "text-gray-400" : "text-gray-500"}>Loading messages...</p>
//               ) : messages.length === 0 ? (
//                 <p className={darkMode ? "text-gray-400" : "text-gray-500"}>No private messages yet. Start the conversation!</p>
//               ) : (
//                 messages.map((msg) => (
//                   <div
//                     key={msg._id}
//                     className={`flex ${
//                       msg.senderId === user.name ? "justify-end" : "justify-start"
//                     } mb-2`}
//                   >
//                     <div
//                       className={`relative max-w-[70%] p-3 rounded-2xl ${
//                         msg.senderId === user.name
//                           ? darkMode
//                             ? "bg-purple-600 text-white"
//                             : "bg-purple-300 text-gray-900"
//                           : darkMode
//                           ? "bg-gray-700 text-gray-300"
//                           : "bg-gray-300 text-gray-700"
//                       } flex flex-col group hover:shadow-md transition-all`}
//                     >
//                       {msg.replyTo && (
//                         <div className={`text-xs italic mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
//                           Replying to: {messages.find((m) => m._id === msg.replyTo)?.text || "Deleted Message"}
//                         </div>
//                       )}
//                       <div className="flex items-start gap-2">
//                         <div>
//                           <span className={`font-semibold ${darkMode ? "text-purple-300" : "text-purple-600"}`}>{msg.senderId}: </span>
//                           <span>{msg.text}</span>
//                         </div>
//                         <button
//                           onClick={() => toggleMenu(msg._id)}
//                           className={`p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
//                             darkMode
//                               ? "text-gray-300 hover:text-purple-300"
//                               : "text-gray-700 hover:text-purple-600"
//                           }`}
//                           data-tooltip-id={`menu-tooltip-${msg._id}`}
//                           data-tooltip-content="Message Options"
//                         >
//                           <MoreVertical size={16} />
//                         </button>
//                         <Tooltip id={`menu-tooltip-${msg._id}`} />
//                       </div>
//                       <div className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
//                         {formatTimestamp(msg.timestamp)}
//                         {msg.senderId === user.name && msg.seenAt && (
//                           <div>{formatSeenStatus(msg.seenAt)}</div>
//                         )}
//                       </div>
//                       {menuOpen === msg._id && (
//                         <div
//                           className={`absolute ${
//                             msg.senderId === user.name ? "right-0" : "left-0"
//                           } mt-8 w-32 rounded-lg shadow-lg z-20 ${
//                             darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
//                           } border ${darkMode ? "border-gray-700" : "border-gray-300"}`}
//                         >
//                           {msg.senderId === user.name && (
//                             <>
//                               <button
//                                 onClick={() => handleEditMessage(msg._id, prompt("Edit message:", msg.text))}
//                                 className={`w-full text-left px-4 py-2 hover:${darkMode ? "bg-purple-700" : "bg-purple-200"} flex items-center gap-2`}
//                                 data-tooltip-id={`edit-tooltip-${msg._id}`}
//                                 data-tooltip-content="Edit Message"
//                               >
//                                 <Edit2 size={14} /> Edit
//                               </button>
//                               <Tooltip id={`edit-tooltip-${msg._id}`} />
//                               <button
//                                 onClick={() => handleDeleteMessage(msg._id)}
//                                 className={`w-full text-left px-4 py-2 hover:${darkMode ? "bg-red-700" : "bg-red-200"} flex items-center gap-2`}
//                                 data-tooltip-id={`delete-tooltip-${msg._id}`}
//                                 data-tooltip-content="Delete Message"
//                               >
//                                 <svg
//                                   width="14"
//                                   height="14"
//                                   viewBox="0 0 24 24"
//                                   fill="none"
//                                   stroke="currentColor"
//                                   strokeWidth="2"
//                                   strokeLinecap="round"
//                                   strokeLinejoin="round"
//                                 >
//                                   <polyline points="3 6 5 6 21 6"></polyline>
//                                   <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
//                                   <line x1="10" y1="11" x2="10" y2="17"></line>
//                                   <line x1="14" y1="11" x2="14" y2="17"></line>
//                                 </svg>
//                                 Delete
//                               </button>
//                               <Tooltip id={`delete-tooltip-${msg._id}`} />
//                             </>
//                           )}
//                           <button
//                             onClick={() => handleReply(msg)}
//                             className={`w-full text-left px-4 py-2 hover:${darkMode ? "bg-blue-700" : "bg-blue-200"} flex items-center gap-2`}
//                             data-tooltip-id={`reply-tooltip-${msg._id}`}
//                             data-tooltip-content="Reply to Message"
//                           >
//                             <svg
//                               width="14"
//                               height="14"
//                               viewBox="0 0 24 24"
//                               fill="none"
//                               stroke="currentColor"
//                               strokeWidth="2"
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                             >
//                               <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
//                             </svg>
//                             Reply
//                           </button>
//                           <Tooltip id={`reply-tooltip-${msg._id}`} />
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))
//               )}
//               {typing && (
//                 <div className="text-sm italic text-gray-400 animate-pulse">
//                   {recipientId} is typing...
//                 </div>
//               )}
//               <div ref={messagesEndRef} />
//             </div>

//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 placeholder={
//                   replyTo
//                     ? `Replying to ${replyTo.senderId}: ${replyTo.text.slice(0, 20)}...`
//                     : "Type a message..."
//                 }
//                 value={message}
//                 onChange={handleTyping}
//                 onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
//                 className={`flex-1 p-3 rounded-lg border ${darkMode ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
//                 disabled={!user}
//               />
//               <button
//                 onClick={handleSendMessage}
//                 className={`relative bg-purple-700 text-white font-bold py-3 px-4 rounded-full transition-all duration-300 overflow-hidden group hover:bg-purple-500 ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
//                 disabled={!user}
//                 data-tooltip-id="send-tooltip"
//                 data-tooltip-content="Send Message"
//               >
//                 <span className="relative z-10">
//                   <Send size={16} />
//                 </span>
//                 <span className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-30 transition-opacity duration-300 transform -skew-x-12"></span>
//               </button>
//               <Tooltip id="send-tooltip" />
//             </div>
//           </>
//         )}
//       </div>

//       {error && (
//         <div
//           className={`fixed top-20 right-6 p-4 rounded-lg shadow-lg max-w-sm ${darkMode ? "bg-red-800 text-red-300 border border-red-700" : "bg-red-100 text-red-700 border border-red-300"} animate-slide-in`}
//         >
//           <p>{error}</p>
//         </div>
//       )}

//       <style>{`
//         @keyframes slideIn {
//           from {
//             transform: translateX(100%);
//             opacity: 0;
//           }
//           to {
//             transform: translateX(0);
//             opacity: 1;
//           }
//         }
//         .animate-slide-in {
//           animation: slideIn 0.3s ease-out;
//         }
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//           }
//           to {
//             opacity: 1;
//           }
//         }
//         .animate-fade-in {
//           animation: fadeIn 0.5s ease-in-out;
//         }
//         @keyframes colorFlowDark {
//           0% {
//             color: #ffffff;
//           }
//           25% {
//             color: #a855f7;
//           }
//           50% {
//             color: #8b5cf6;
//           }
//           75% {
//             color: #6366f1;
//           }
//           100% {
//             color: #ffffff;
//           }
//         }
//         .animate-color-flow-dark {
//           animation: colorFlowDark 6s infinite ease-in-out;
//         }
//         @keyframes colorFlowLight {
//           0% {
//             color: #6b7280;
//           }
//           25% {
//             color: #a855f7;
//           }
//           50% {
//             color: #ec4899;
//           }
//           75% {
//             color: #3b82f6;
//           }
//           100% {
//             color: #6b7280;
//           }
//         }
//         .animate-color-flow-light {
//           animation: colorFlowLight 6s infinite ease-in-out;
//         }
//       `}</style>
//     </div>
//   );
// }

// export default PrivateChatPage;

import React, { useState, useEffect, useRef } from "react";
import { Send, Edit2, LogOut, MoreVertical, Moon, Sun, ArrowLeft, Home } from "lucide-react";
import io from "socket.io-client";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";

console.log("Socket.IO URL:", import.meta.env.VITE_API_URL);
const socket = io(import.meta.env.VITE_API_URL || "https://s69-name-blender-4.onrender.com", {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
});

function PrivateChatPage() {
  const { recipientId } = useParams();
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode !== null ? JSON.parse(savedMode) : true;
  });
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
      socket.emit("join", parsedUser.name, (response) => {
        console.log("Join response:", response);
        setIsOnline(true);
      });

      axios
        .get(
          `${(import.meta.env.VITE_API_URL || "https://s69-name-blender-4.onrender.com").replace(/\/$/, "")}/api/private-messages/${parsedUser.name}/${recipientId}`
        )
        .then((response) => {
          console.log("Fetched private messages:", response.data);
          setMessages(Array.isArray(response.data) ? response.data : []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching private messages:", err.response ? err.response.data : err.message);
          setError("Failed to load messages. Please try again.");
          setMessages([]);
          setLoading(false);
        });

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
        setIsOnline(false);
        setError("Connection lost. Reconnecting...");
      });

      socket.on("connect", () => {
        console.log("Socket connected:", parsedUser.name);
        setIsOnline(true);
        socket.emit("join", parsedUser.name);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", parsedUser.name);
        setIsOnline(false);
      });
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      setError("Invalid user data. Please log in again.");
      setLoading(false);
    }

    return () => {
      socket.disconnect();
      setIsOnline(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [recipientId]);

  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      console.log("Received private message:", msg);
      if (
        msg.isPrivate &&
        ((msg.senderId === user?.name && msg.recipientId === recipientId) ||
         (msg.senderId === recipientId && msg.recipientId === user?.name))
      ) {
        setMessages((prev) => {
          if (!prev.some((m) => m._id === msg._id)) {
            return [...prev, msg];
          }
          return prev;
        });
        setTyping(false);
      }
    };

    const handleTyping = ({ senderId }) => {
      console.log("Typing event from:", senderId);
      if (senderId === recipientId && senderId !== user?.name) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        setTyping(true);
        typingTimeoutRef.current = setTimeout(() => {
          setTyping(false);
        }, 2000);
      }
    };

    const handleStopTyping = ({ senderId }) => {
      console.log("Stop typing event from:", senderId);
      if (senderId === recipientId && senderId !== user?.name) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        setTyping(false);
      }
    };

    const handleMessageDeleted = ({ messageId }) => {
      console.log("Message deleted:", messageId);
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      setMenuOpen(null);
    };

    const handleMessageEdited = ({ messageId, newText }) => {
      console.log("Message edited:", messageId, newText);
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, text: newText } : msg))
      );
    };

    const handleMessageSeen = ({ messageId, seenAt }) => {
      console.log("Message seen:", messageId, seenAt);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, seenAt } : msg
        )
      );
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
      if (
        msg.isPrivate &&
        msg.recipientId === user?.name &&
        msg.senderId === recipientId &&
        !msg.seenAt
      ) {
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
    console.log("Sending private message:", newMessage);
    socket.emit("sendPrivateMessage", newMessage, (response) => {
      console.log("Send response:", response);
      if (response.status !== "success") {
        setError("Failed to send message: " + response.message);
      }
    });
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
    if (newText) {
      socket.emit("editMessage", { messageId: msgId, newText, senderId: user.name });
    }
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
    setMenuOpen(menuOpen === msgId ? null : msgId);
  };

  const handleReply = (msg) => {
    setReplyTo(msg);
    setMenuOpen(null);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp || isNaN(new Date(timestamp).getTime())) return "Invalid Date";
    return new Date(timestamp).toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).replace(",", "");
  };

  const formatSeenStatus = (seenAt) => {
    if (!seenAt || isNaN(new Date(seenAt).getTime())) return "";
    const now = Date.now();
    const diffMs = now - new Date(seenAt).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Seen just now";
    if (diffMins === 1) return "Seen 1 min ago";
    if (diffMins < 60) return `Seen ${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "Seen 1 hour ago";
    if (diffHours < 24) return `Seen ${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Seen 1 day ago";
    return `Seen ${diffDays} days ago`;
  };

  if (error) {
    return (
      <div
        className={`${
          darkMode ? "bg-gradient-to-br from-gray-900 via-black to-purple-950" : "bg-gradient-to-br from-white via-gray-100 to-purple-100"
        } min-h-screen flex flex-col items-center justify-center p-6`}
      >
        <div className={`p-6 rounded-2xl shadow-xl max-w-md text-center ${darkMode ? "bg-gray-900 bg-opacity-30 border border-gray-700" : "bg-gray-200 bg-opacity-80 border border-gray-300"}`}>
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
      className={`${
        darkMode ? "bg-gradient-to-br from-gray-900 via-black to-purple-950" : "bg-gradient-to-br from-white via-gray-100 to-purple-100"
      } min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-500 relative overflow-hidden`}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse absolute ${
            darkMode ? "top-10 left-10" : "top-20 right-20"
          }`}
        ></div>
        <div
          className={`w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse absolute ${
            darkMode ? "bottom-20 right-20" : "bottom-10 left-10"
          } delay-1000`}
        ></div>
      </div>

      {user && (
        <div className="fixed top-4 left-6 z-20 flex items-center gap-2">
          <button
            onClick={() => navigate("/ChatPage")}
            className={`p-2 rounded-full ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-blue-200 hover:bg-blue-300 text-gray-900"} transition-all`}
            data-tooltip-id="back-tooltip"
            data-tooltip-content="Back to Global Chat"
          >
            <ArrowLeft size={16} />
          </button>
          <Tooltip id="back-tooltip" />
          <span className={`text-lg font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Chatting with <span className={`${darkMode ? "animate-color-flow-dark hover:text-purple-300" : "animate-color-flow-light hover:text-purple-600"} transition`}>{recipientId}</span>
          </span>
          <span className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-400" : "bg-red-400"}`}></span>
        </div>
      )}

      <div className="fixed top-4 right-10 z-20 flex gap-4">
        <button
          onClick={() => navigate("/homePage")}
          className={`p-2 rounded-full ${
            darkMode
              ? "bg-gray-700 hover:bg-gray-600 text-white"
              : "bg-blue-200 hover:bg-blue-300 text-gray-900"
          } transition-all`}
          data-tooltip-id="home-tooltip"
          data-tooltip-content="Go to Homepage"
        >
          <Home size={16} />
        </button>
        <Tooltip id="home-tooltip" />
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-full ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-yellow-200 hover:bg-yellow-300 text-gray-900"} transition-all`}
          data-tooltip-id="mode-tooltip"
          data-tooltip-content={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <Tooltip id="mode-tooltip" />
        {user && (
          <button
            onClick={handleLogout}
            className={`p-2 rounded-full ${darkMode ? "bg-red-600 hover:bg-red-500" : "bg-red-400 hover:bg-red-300"} transition-all`}
            data-tooltip-id="logout-tooltip"
            data-tooltip-content="Log Out"
          >
            <LogOut size={16} className="text-white" />
          </button>
        )}
        <Tooltip id="logout-tooltip" />
      </div>

      <div
        className={`p-6 rounded-2xl shadow-xl w-full max-w-2xl text-center transition-all duration-300 backdrop-blur-md ${
          darkMode ? "bg-gray-900 bg-opacity-30 border border-gray-700" : "bg-gray-200 bg-opacity-80 border border-gray-300"
        } relative z-10 mt-16`}
      >
        <h1 className={`text-3xl font-bold mb-4 animate-fade-in ${darkMode ? "text-white" : "text-gray-900"}`}>
          💬 Private Chat with {recipientId}
        </h1>
        {!user ? (
          <div className="flex flex-col items-center gap-4">
            <p className={`text-md mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Please log in to chat.</p>
            <button
              onClick={() => navigate("/login")}
              className={`px-4 py-2 rounded-full ${darkMode ? "bg-purple-700 hover:bg-purple-600 text-white" : "bg-purple-500 hover:bg-purple-400 text-white"} transition-all`}
              data-tooltip-id="login-tooltip"
              data-tooltip-content="Go to Login Page"
            >
              Go to Login
            </button>
            <Tooltip id="login-tooltip" />
          </div>
        ) : (
          <>
            <div className="max-h-64 overflow-y-auto mb-4 p-4 bg-opacity-50 rounded-lg flex flex-col gap-2">
              {loading ? (
                <p className={darkMode ? "text-gray-400" : "text-gray-500"}>Loading messages...</p>
              ) : messages.length === 0 ? (
                <p className={darkMode ? "text-gray-400" : "text-gray-500"}>No private messages yet. Start the conversation!</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex flex-col ${
                      msg.senderId === user.name ? "items-end" : "items-start"
                    } mb-2`}
                  >
                    <div
                      className={`relative max-w-[70%] p-3 rounded-2xl ${
                        msg.senderId === user.name
                          ? darkMode
                            ? "bg-purple-600 text-white"
                            : "bg-purple-300 text-gray-900"
                          : darkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-300 text-gray-700"
                      } flex flex-col group hover:shadow-md transition-all`}
                    >
                      {msg.replyTo && (
                        <div className={`text-xs italic mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Replying to: {messages.find((m) => m._id === msg.replyTo)?.text || "Deleted Message"}
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <div className="flex flex-col w-full">
                          <span className={`text-xs font-semibold ${darkMode ? "text-purple-300" : "text-purple-600"} mb-1`}>
                            {msg.senderId}
                          </span>
                          <span>{msg.text}</span>
                        </div>
                        <button
                          onClick={() => toggleMenu(msg._id)}
                          className={`p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                            darkMode
                              ? "text-gray-300 hover:text-purple-300"
                              : "text-gray-700 hover:text-purple-600"
                          }`}
                          data-tooltip-id={`menu-tooltip-${msg._id}`}
                          data-tooltip-content="Message Options"
                        >
                          <MoreVertical size={16} />
                        </button>
                        <Tooltip id={`menu-tooltip-${msg._id}`} />
                      </div>
                      <div className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {formatTimestamp(msg.timestamp)}
                      </div>
                      {menuOpen === msg._id && (
                        <div
                          className={`absolute ${
                            msg.senderId === user.name ? "right-0" : "left-0"
                          } mt-8 w-32 rounded-lg shadow-lg z-20 ${
                            darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                          } border ${darkMode ? "border-gray-700" : "border-gray-300"}`}
                        >
                          {msg.senderId === user.name && (
                            <>
                              <button
                                onClick={() => handleEditMessage(msg._id, prompt("Edit message:", msg.text))}
                                className={`w-full text-left px-4 py-2 hover:${darkMode ? "bg-purple-700" : "bg-purple-200"} flex items-center gap-2`}
                                data-tooltip-id={`edit-tooltip-${msg._id}`}
                                data-tooltip-content="Edit Message"
                              >
                                <Edit2 size={14} /> Edit
                              </button>
                              <Tooltip id={`edit-tooltip-${msg._id}`} />
                              <button
                                onClick={() => handleDeleteMessage(msg._id)}
                                className={`w-full text-left px-4 py-2 hover:${darkMode ? "bg-red-700" : "bg-red-200"} flex items-center gap-2`}
                                data-tooltip-id={`delete-tooltip-${msg._id}`}
                                data-tooltip-content="Delete Message"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
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
                            className={`w-full text-left px-4 py-2 hover:${darkMode ? "bg-blue-700" : "bg-blue-200"} flex items-center gap-2`}
                            data-tooltip-id={`reply-tooltip-${msg._id}`}
                            data-tooltip-content="Reply to Message"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                            </svg>
                            Reply
                          </button>
                          <Tooltip id={`reply-tooltip-${msg._id}`} />
                        </div>
                      )}
                    </div>
                    {msg.senderId === user.name && msg.seenAt && (
                      <div
                        className={`text-xs mt-1 ${
                          darkMode ? "text-gray-500" : "text-gray-400"
                        } ${msg.senderId === user.name ? "self-end" : "self-start"}`}
                      >
                        {formatSeenStatus(msg.seenAt)}
                      </div>
                    )}
                  </div>
                ))
              )}
              {typing && (
                <div className="text-sm italic text-gray-400 animate-pulse">
                  {recipientId} is typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder={
                  replyTo
                    ? `Replying to ${replyTo.senderId}: ${replyTo.text.slice(0, 20)}...`
                    : "Type a message..."
                }
                value={message}
                onChange={handleTyping}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className={`flex-1 p-3 rounded-lg border ${darkMode ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
                disabled={!user}
              />
              <button
                onClick={handleSendMessage}
                className={`relative bg-purple-700 text-white font-bold py-3 px-4 rounded-full transition-all duration-300 overflow-hidden group hover:bg-purple-500 ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={!user}
                data-tooltip-id="send-tooltip"
                data-tooltip-content="Send Message"
              >
                <span className="relative z-10">
                  <Send size={16} />
                </span>
                <span className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-30 transition-opacity duration-300 transform -skew-x-12"></span>
              </button>
              <Tooltip id="send-tooltip" />
            </div>
          </>
        )}
      </div>

      {error && (
        <div
          className={`fixed top-20 right-6 p-4 rounded-lg shadow-lg max-w-sm ${darkMode ? "bg-red-800 text-red-300 border border-red-700" : "bg-red-100 text-red-700 border border-red-300"} animate-slide-in`}
        >
          <p>{error}</p>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes colorFlowDark {
          0% {
            color: #ffffff;
          }
          25% {
            color: #a855f7;
          }
          50% {
            color: #8b5cf6;
          }
          75% {
            color: #6366f1;
          }
          100% {
            color: #ffffff;
          }
        }
        .animate-color-flow-dark {
          animation: colorFlowDark 6s infinite ease-in-out;
        }
        @keyframes colorFlowLight {
          0% {
            color: #6b7280;
          }
          25% {
            color: #a855f7;
          }
          50% {
            color: #ec4899;
          }
          75% {
            color: #3b82f6;
          }
          100% {
            color: #6b7280;
          }
        }
        .animate-color-flow-light {
          animation: colorFlowLight 6s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default PrivateChatPage;

