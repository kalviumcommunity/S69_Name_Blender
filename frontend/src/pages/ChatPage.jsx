// import React, { useState, useEffect, useRef } from "react";
// import { Send, Edit2, LogOut, Moon, Sun, Home, Search } from "lucide-react";
// import io from "socket.io-client";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { Tooltip } from "react-tooltip";

// console.log("Socket.IO URL:", import.meta.env.VITE_API_URL);
// const socket = io(import.meta.env.VITE_API_URL || "https://s69-name-blender-4.onrender.com", {
//   autoConnect: false,
//   reconnection: true,
//   reconnectionAttempts: 5,
// });

// function ChatPage() {
//   const [darkMode, setDarkMode] = useState(() => {
//     const savedMode = localStorage.getItem("darkMode");
//     return savedMode !== null ? JSON.parse(savedMode) : true;
//   });
//   const [user, setUser] = useState(null);
//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [typingUsers, setTypingUsers] = useState([]);
//   const [isOnline, setIsOnline] = useState(false);
//   const [menuOpen, setMenuOpen] = useState(null);
//   const [notification, setNotification] = useState(null);
//   const [privateChatPrompt, setPrivateChatPrompt] = useState(null);
//   const [pendingChatRequest, setPendingChatRequest] = useState(null);
//   const [replyTo, setReplyTo] = useState(null);
//   const messagesEndRef = useRef(null);
//   const touchTimeoutRef = useRef(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     localStorage.setItem("darkMode", JSON.stringify(darkMode));
//   }, [darkMode]);

//   useEffect(() => {
//     let timeoutId;

//     const initialize = async () => {
//       const storedUser = localStorage.getItem("user");
//       if (!storedUser) {
//         setNotification({ message: "Please log in.", type: "error" });
//         return;
//       }

//       try {
//         const parsedUser = JSON.parse(storedUser);
//         if (!parsedUser.name) {
//           throw new Error("Invalid user data");
//         }
//         setUser(parsedUser);

//         try {
//           const response = await axios.get(
//             `${(import.meta.env.VITE_API_URL || "https://s69-name-blender-4.onrender.com").replace(/\/$/, "")}/api/messages`
//           );
//           if (Array.isArray(response.data)) {
//             setMessages(response.data);
//           } else {
//             console.warn("Unexpected messages format:", response.data);
//             setMessages([]);
//           }
//         } catch (err) {
//           console.error("Error fetching messages:", err.message);
//           setNotification({ message: "Failed to load messages.", type: "error" });
//           setTimeout(() => setNotification(null), 5000);
//         }

//         socket.connect();
//         socket.emit("join", parsedUser.name, (response) => {
//           console.log("Join response:", response);
//           if (response?.status === "success") {
//             setIsOnline(true);
//           } else {
//             setNotification({ message: "Failed to join chat.", type: "error" });
//             setTimeout(() => setNotification(null), 5000);
//           }
//         });
//       } catch (error) {
//         console.error("Initialization error:", error.message);
//         setNotification({ message: "Invalid user data. Please log in again.", type: "error" });
//         setTimeout(() => setNotification(null), 5000);
//       }
//     };

//     initialize();

//     const handleConnectError = (err) => {
//       console.error("Socket connection error:", err.message);
//       setIsOnline(false);
//       setNotification({ message: "Connection lost. Reconnecting...", type: "error" });
//       setTimeout(() => setNotification(null), 5000);
//     };

//     const handleConnect = () => {
//       console.log("Socket connected");
//       setIsOnline(true);
//       if (user?.name) {
//         socket.emit("join", user.name);
//       }
//     };

//     const handleDisconnect = () => {
//       console.log("Socket disconnected");
//       setIsOnline(false);
//     };

//     const handleReceiveMessage = (msg) => {
//       console.log("Received message:", msg);
//       if (!msg.isPrivate && msg._id) {
//         setMessages((prev) => {
//           if (!prev.some((m) => m._id === msg._id)) {
//             return [...prev, msg];
//           }
//           return prev;
//         });
//         setTypingUsers((prev) => prev.filter((u) => u !== msg.senderId));
//       }
//     };

//     const handleUserList = ({ users }) => {
//       console.log("Received user list:", users);
//       if (Array.isArray(users)) {
//         setUsers(users.filter((u) => u !== user?.name));
//       }
//     };

//     const handleTyping = ({ senderId }) => {
//       console.log("Typing:", senderId);
//       if (senderId && senderId !== user?.name && !typingUsers.includes(senderId)) {
//         setTypingUsers((prev) => [...new Set([...prev, senderId])]);
//       }
//     };

//     const handleStopTyping = ({ senderId }) => {
//       console.log("Stop typing:", senderId);
//       if (senderId) {
//         setTypingUsers((prev) => prev.filter((u) => u !== senderId));
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
//         prev.map((msg) =>
//           msg._id === messageId ? { ...msg, text: newText } : msg
//         )
//       );
//     };

//     const handlePrivateChatRequest = ({ senderId, recipientId }) => {
//       console.log("Private chat request:", { senderId, recipientId });
//       if (recipientId === user?.name && senderId !== user?.name) {
//         setPrivateChatPrompt({ senderId, recipientId });
//       }
//     };

//     const handlePrivateChatAccepted = ({ senderId, recipientId }) => {
//       console.log("Private chat accepted:", { senderId, recipientId });
//       if (senderId === user?.name || recipientId === user?.name) {
//         const otherUser = senderId === user?.name ? recipientId : senderId;
//         setNotification({
//           message: `Private chat with ${otherUser} accepted!`,
//           type: "success",
//         });
//         setTimeout(() => setNotification(null), 5000);
//         setPendingChatRequest(null);
//         setPrivateChatPrompt(null);
//         navigate(`/private-chat/${otherUser}`);
//       }
//     };

//     const handlePrivateChatRejected = ({ senderId, recipientId }) => {
//       console.log("Private chat rejected:", { senderId, recipientId });
//       if (senderId === user?.name) {
//         setNotification({
//           message: `${recipientId} rejected your private chat request.`,
//           type: "error",
//         });
//         setTimeout(() => setNotification(null), 5000);
//         setPendingChatRequest(null);
//       }
//     };

//     socket.on("connect_error", handleConnectError);
//     socket.on("connect", handleConnect);
//     socket.on("disconnect", handleDisconnect);
//     socket.on("receiveMessage", handleReceiveMessage);
//     socket.on("userList", handleUserList);
//     socket.on("typing", handleTyping);
//     socket.on("stopTyping", handleStopTyping);
//     socket.on("messageDeleted", handleMessageDeleted);
//     socket.on("messageEdited", handleMessageEdited);
//     socket.on("privateChatRequest", handlePrivateChatRequest);
//     socket.on("privateChatAccepted", handlePrivateChatAccepted);
//     socket.on("privateChatRejected", handlePrivateChatRejected);

//     return () => {
//       socket.off("connect_error", handleConnectError);
//       socket.off("connect", handleConnect);
//       socket.off("disconnect", handleDisconnect);
//       socket.off("receiveMessage", handleReceiveMessage);
//       socket.off("userList", handleUserList);
//       socket.off("typing", handleTyping);
//       socket.off("stopTyping", handleStopTyping);
//       socket.off("messageDeleted", handleMessageDeleted);
//       socket.off("messageEdited", handleMessageEdited);
//       socket.on("privateChatRequest", handlePrivateChatRequest);
//       socket.on("privateChatAccepted", handlePrivateChatAccepted);
//       socket.on("privateChatRejected", handlePrivateChatRejected);
//       socket.disconnect();
//       clearTimeout(timeoutId);
//       if (touchTimeoutRef.current) {
//         clearTimeout(touchTimeoutRef.current);
//       }
//     };
//   }, [user?.name, navigate]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleSendMessage = () => {
//     if (!user?.name || !message.trim()) {
//       console.warn("Cannot send message: user or message invalid");
//       return;
//     }
//     const newMessage = {
//       senderId: user.name,
//       text: message.trim(),
//       timestamp: Date.now(),
//       replyTo: replyTo?._id || null,
//     };
//     console.log("Sending message:", newMessage);
//     socket.emit("sendMessage", newMessage, (response) => {
//       console.log("Send message response:", response);
//       if (response?.status !== "success") {
//         setNotification({ message: "Failed to send message.", type: "error" });
//         setTimeout(() => setNotification(null), 5000);
//       }
//     });
//     socket.emit("stopTyping", { senderId: user.name });
//     setMessage("");
//     setReplyTo(null);
//   };

//   const startPrivateChat = (recipientId) => {
//     if (!user?.name || recipientId === user.name || pendingChatRequest) return;
//     console.log("Checking private chat with:", recipientId);
    
//     socket.emit("checkPrivateChatRelationship", { senderId: user.name, recipientId }, (response) => {
//       console.log("Check private chat relationship response:", response);
//       if (response.status === "success" && response.exists) {
//         setNotification({
//           message: `Opening private chat with ${recipientId}.`,
//           type: "success",
//         });
//         setTimeout(() => setNotification(null), 5000);
//         navigate(`/private-chat/${recipientId}`);
//       } else {
//         socket.emit("privateChatRequest", { senderId: user.name, recipientId });
//         setPendingChatRequest(recipientId);
//         setNotification({
//           message: `Private chat request sent to ${recipientId}. Waiting...`,
//           type: "info",
//         });
//         setTimeout(() => {
//           if (pendingChatRequest === recipientId) {
//             setNotification(null);
//             setPendingChatRequest(null);
//           }
//         }, 30000);
//       }
//     });
//   };

//   const handleAcceptPrivateChat = () => {
//     if (!privateChatPrompt) return;
//     console.log("Accepting private chat:", privateChatPrompt);
//     socket.emit("acceptPrivateChat", {
//       senderId: privateChatPrompt.senderId,
//       recipientId: privateChatPrompt.recipientId,
//     });
//   };

//   const handleRejectPrivateChat = () => {
//     if (!privateChatPrompt) return;
//     console.log("Rejecting private chat:", privateChatPrompt);
//     socket.emit("rejectPrivateChat", {
//       senderId: privateChatPrompt.senderId,
//       recipientId: privateChatPrompt.recipientId,
//     });
//     setPrivateChatPrompt(null);
//   };

//   const handleTyping = (e) => {
//     const value = e.target.value;
//     setMessage(value);
//     if (!user?.name) return;
//     if (value.trim()) {
//       socket.emit("typing", { senderId: user.name });
//     } else {
//       socket.emit("stopTyping", { senderId: user.name });
//     }
//   };

//   const handleDeleteMessage = (msgId) => {
//     if (!user?.name || !msgId) {
//       console.warn("Cannot delete message: user or msgId invalid");
//       return;
//     }
//     console.log("Deleting message:", { messageId: msgId, senderId: user.name });
//     socket.emit("deleteMessage", { messageId: msgId, senderId: user.name }, (response) => {
//       console.log("Delete message response:", response);
//       if (response?.status !== "success") {
//         setNotification({ message: "Failed to delete message.", type: "error" });
//         setTimeout(() => setNotification(null), 5000);
//       }
//     });
//     setMenuOpen(null);
//   };

//   const handleEditMessage = (msgId, newText) => {
//     if (!user?.name || !msgId || !newText?.trim()) {
//       console.warn("Cannot edit message: user, msgId, or newText invalid");
//       return;
//     }
//     console.log("Editing message:", { messageId: msgId, newText });
//     socket.emit("editMessage", { messageId: msgId, newText, senderId: user.name });
//     setMenuOpen(null);
//   };

//   const handleReply = (msg) => {
//     if (!user?.name || !msg?._id) {
//       console.warn("Cannot reply: user or message invalid");
//       return;
//     }
//     console.log("Setting reply to message:", msg);
//     setReplyTo(msg);
//     setMenuOpen(null);
//   };

//   const handleLogout = () => {
//     console.log("Logging out");
//     localStorage.removeItem("user");
//     socket.disconnect();
//     setUser(null);
//     setMessages([]);
//     setUsers([]);
//     setIsOnline(false);
//     navigate("/login");
//   };

//   const toggleMenu = (msgId) => {
//     setMenuOpen(menuOpen === msgId ? null : msgId);
//   };

//   const handleTouchStart = (msgId) => {
//     touchTimeoutRef.current = setTimeout(() => {
//       toggleMenu(msgId);
//     }, 500); // 500ms hold to show options
//   };

//   const handleTouchEnd = () => {
//     if (touchTimeoutRef.current) {
//       clearTimeout(touchTimeoutRef.current);
//     }
//   };

//   const formatTimestamp = (timestamp) => {
//     if (!timestamp || isNaN(new Date(timestamp).getTime())) {
//       return "Invalid Time";
//     }
//     return new Date(timestamp).toLocaleTimeString("en-US", {
//       hour: "numeric",
//       minute: "numeric",
//       hour12: true,
//     });
//   };

//   const formatDateHeader = (timestamp) => {
//     if (!timestamp || isNaN(new Date(timestamp).getTime())) {
//       return "Invalid Date";
//     }
//     return new Date(timestamp).toLocaleDateString("en-US", {
//       weekday: "long",
//       month: "long",
//       day: "numeric",
//       year: "numeric",
//     });
//   };

//   const groupedMessages = () => {
//     const groups = [];
//     let currentDate = null;

//     messages.forEach((msg, index) => {
//       const messageDate = formatDateHeader(msg.timestamp);
//       if (messageDate !== currentDate) {
//         currentDate = messageDate;
//         groups.push({ date: messageDate, messages: [] });
//       }
//       groups[groups.length - 1].messages.push(msg);
//     });

//     return groups;
//   };

//   const filteredUsers = users.filter((u) =>
//     u.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   if (notification?.message === "Please log in.") {
//     return (
//       <div
//         className={`${
//           darkMode
//             ? "bg-gradient-to-br from-gray-900 via-black to-purple-950"
//             : "bg-gradient-to-br from-white via-gray-100 to-purple-100"
//         } min-h-screen flex flex-col items-center justify-center p-6`}
//       >
//         <div
//           className={`p-6 rounded-2xl shadow-xl max-w-md text-center ${
//             darkMode
//               ? "bg-gray-900 bg-opacity-30 border border-gray-700"
//               : "bg-gray-200 bg-opacity-80 border border-gray-300"
//           }`}
//         >
//           <p className={darkMode ? "text-red-300" : "text-red-500"}>
//             Please log in to chat.
//           </p>
//           <button
//             onClick={() => navigate("/login")}
//             className={`mt-4 px-4 py-2 rounded-full ${
//               darkMode
//                 ? "bg-purple-700 hover:bg-purple-600 text-white"
//                 : "bg-purple-500 hover:bg-purple-400 text-white"
//             }`}
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
//         darkMode
//           ? "bg-gradient-to-br from-gray-900 via-black to-purple-950"
//           : "bg-gradient-to-br from-white via-gray-100 to-purple-100"
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
//         <div className="fixed top-4 left-6 z-20 flex items-center gap-4">
//           <span
//             className={`text-lg font-semibold ${
//               darkMode ? "text-gray-300" : "text-gray-700"
//             }`}
//           >
//             Welcome,{" "}
//             <span
//               className={`${
//                 darkMode
//                   ? "animate-color-flow-dark hover:text-purple-300"
//                   : "animate-color-flow-light hover:text-purple-600"
//               } transition`}
//             >
//               {user.name}
//             </span>
//           </span>
//           <span
//             className={`w-3 h-3 rounded-full ${
//               isOnline ? "bg-green-400" : "bg-red-400"
//             }`}
//           ></span>
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
//           className={`p-2 rounded-full ${
//             darkMode
//               ? "bg-gray-700 hover:bg-gray-600 text-white"
//               : "bg-yellow-200 hover:bg-yellow-300 text-gray-900"
//           } transition-all`}
//           data-tooltip-id="mode-tooltip"
//           data-tooltip-content={
//             darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
//           }
//         >
//           {darkMode ? <Sun size={16} /> : <Moon size={16} />}
//         </button>
//         <Tooltip id="mode-tooltip" />
//         {user && (
//           <button
//             onClick={handleLogout}
//             className={`p-2 rounded-full ${
//               darkMode ? "bg-red-600 hover:bg-red-500" : "bg-red-400 hover:bg-red-300"
//             } transition-all`}
//             data-tooltip-id="logout-tooltip"
//             data-tooltip-content="Log Out"
//           >
//             <LogOut size={16} className="text-white" />
//           </button>
//         )}
//         <Tooltip id="logout-tooltip" />
//       </div>

//       <div
//         className={`p-6 rounded-2xl shadow-xl w-full max-w-2xl transition-all duration-300 backdrop-blur-md ${
//           darkMode
//             ? "bg-gray-900 bg-opacity-30 border border-gray-700"
//             : "bg-gray-200 bg-opacity-80 border border-gray-300"
//         } relative z-10 mt-16 flex flex-col h-[80vh]`}
//       >
//         {user && (
//           <>
//             <h1
//               className={`text-3xl font-bold mb-4 animate-fade-in ${
//                 darkMode ? "text-white" : "text-gray-900"
//               }`}
//             >
//               💬 Global Chat
//             </h1>
//             <div
//               className={`mb-4 text-sm font-medium ${
//                 darkMode
//                   ? "animate-color-flow-dark text-purple-300"
//                   : "animate-color-flow-light text-purple-600"
//               }`}
//             >
//               Click on a User Name to chat privately
//             </div>
//             <div className="mb-4">
//               <div className="w-full">
//                 <p
//                   className={`text-sm mb-2 ${
//                     darkMode ? "text-gray-300" : "text-gray-700"
//                   }`}
//                 >
//                   Online Users ({filteredUsers.length})
//                 </p>
//                 <div className="relative mb-3">
//                   <input
//                     type="text"
//                     placeholder="Search users..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className={`w-full p-2 pl-8 rounded-lg border ${
//                       darkMode
//                         ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400"
//                         : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
//                     } focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
//                   />
//                   <Search
//                     size={16}
//                     className={`absolute left-2 top-1/2 transform -translate-y-1/2 ${
//                       darkMode ? "text-gray-400" : "text-gray-500"
//                     }`}
//                   />
//                 </div>
//                 <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
//                   {filteredUsers.length === 0 ? (
//                     <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
//                       No users found.
//                     </p>
//                   ) : (
//                     filteredUsers.map((u) => (
//                       <span
//                         key={u}
//                         className={`text-sm px-3 py-1 rounded-full cursor-pointer ${
//                           darkMode
//                             ? "bg-purple-600 bg-opacity-30 text-purple-300"
//                             : "bg-purple-200 bg-opacity-50 text-purple-600"
//                         } hover:${
//                           darkMode ? "bg-purple-500" : "bg-purple-300"
//                         } transition-all`}
//                         onClick={() => startPrivateChat(u)}
//                         data-tooltip-id={`user-tooltip-${u}`}
//                         data-tooltip-content="Chat Privately"
//                       >
//                         {u}
//                         <Tooltip id={`user-tooltip-${u}`} />
//                       </span>
//                     ))
//                   )}
//                 </div>
//               </div>
//             </div>
//             <div className="flex-1 overflow-y-auto mb-4 p-4 rounded-lg flex flex-col gap-3">
//               {messages.length === 0 ? (
//                 <p className={`text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
//                   No messages yet. Start the conversation!
//                 </p>
//               ) : (
//                 groupedMessages().map((group, groupIndex) => (
//                   <div key={groupIndex} className="mb-4">
//                     <div className="flex items-center justify-center my-2">
//                       <div className={`flex-1 h-px ${darkMode ? "bg-gray-600" : "bg-gray-300"}`}></div>
//                       <span className={`px-3 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
//                         {group.date}
//                       </span>
//                       <div className={`flex-1 h-px ${darkMode ? "bg-gray-600" : "bg-gray-300"}`}></div>
//                     </div>
//                     {group.messages.map((msg) => (
//                       <div
//                         key={msg._id}
//                         className={`flex group relative ${
//                           msg.senderId === user.name ? "justify-end" : "justify-start"
//                         } mb-2`}
//                         onTouchStart={() => handleTouchStart(msg._id)}
//                         onTouchEnd={handleTouchEnd}
//                       >
//                         <div
//                           className={`relative max-w-[65%] p-2.5 rounded-xl flex flex-col transition-all ${
//                             msg.senderId === user.name
//                               ? darkMode
//                                 ? "bg-purple-600 text-white"
//                                 : "bg-purple-300 text-gray-900"
//                               : darkMode
//                               ? "bg-gray-700 text-gray-300"
//                               : "bg-gray-300 text-gray-700"
//                           } ${msg.replyTo ? "ml-4 mr-4" : ""}`}
//                         >
//                           {msg.replyTo && (
//                             <div
//                               className={`text-xs italic mb-1 ${
//                                 darkMode ? "text-gray-400" : "text-gray-500"
//                               } border-l-2 pl-2 ${
//                                 darkMode ? "border-gray-500" : "border-gray-400"
//                               }`}
//                             >
//                               Replying to:{" "}
//                               {messages.find((m) => m._id === msg.replyTo)?.text ||
//                                 "Deleted Message"}
//                             </div>
//                           )}
//                           <div className="flex flex-col w-full">
//                             <span
//                               className={`text-xs font-semibold cursor-pointer ${
//                                 darkMode ? "text-purple-300" : "text-purple-600"
//                               } mb-0.5`}
//                               onClick={() => startPrivateChat(msg.senderId)}
//                               data-tooltip-id={`private-chat-tooltip-${msg._id}`}
//                               data-tooltip-content={`Chat Privately with ${msg.senderId}`}
//                             >
//                               {msg.senderId}
//                             </span>
//                             <span className="text-sm">{msg.text}</span>
//                             <div
//                               className={`text-[10px] mt-0.5 self-${
//                                 msg.senderId === user.name ? "end" : "start"
//                               } ${darkMode ? "text-gray-400" : "text-gray-500"}`}
//                             >
//                               {formatTimestamp(msg.timestamp)}
//                             </div>
//                           </div>
//                           {(menuOpen === msg._id || (msg._id === menuOpen && window.innerWidth >= 768)) && (
//                             <div
//                               className={`absolute z-30 mt-2 w-32 rounded-lg shadow-lg ${
//                                 msg.senderId === user.name ? "right-0" : "left-0"
//                               } ${
//                                 darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
//                               } border ${
//                                 darkMode ? "border-gray-700" : "border-gray-300"
//                               } hidden md:group-hover:block top-full`} // Ensure hover works on desktop
//                             >
//                               {msg.senderId === user.name && (
//                                 <>
//                                   <button
//                                     onClick={() =>
//                                       handleEditMessage(
//                                         msg._id,
//                                         prompt("Edit message:", msg.text)
//                                       )
//                                     }
//                                     className={`w-full text-left px-3 py-1.5 text-sm hover:${
//                                       darkMode ? "bg-purple-700" : "bg-purple-200"
//                                     } flex items-center gap-2`}
//                                     data-tooltip-id={`edit-tooltip-${msg._id}`}
//                                     data-tooltip-content="Edit Message"
//                                   >
//                                     <Edit2 size={12} /> Edit
//                                   </button>
//                                   <Tooltip id={`edit-tooltip-${msg._id}`} />
//                                   <button
//                                     onClick={() => handleDeleteMessage(msg._id)}
//                                     className={`w-full text-left px-3 py-1.5 text-sm hover:${
//                                       darkMode ? "bg-red-700" : "bg-red-200"
//                                     } flex items-center gap-2`}
//                                     data-tooltip-id={`delete-tooltip-${msg._id}`}
//                                     data-tooltip-content="Delete Message"
//                                   >
//                                     <svg
//                                       width="12"
//                                       height="12"
//                                       viewBox="0 0 24 24"
//                                       fill="none"
//                                       stroke="currentColor"
//                                       strokeWidth="2"
//                                       strokeLinecap="round"
//                                       strokeLinejoin="round"
//                                     >
//                                       <polyline points="3 6 5 6 21 6"></polyline>
//                                       <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
//                                       <line x1="10" y1="11" x2="10" y2="17"></line>
//                                       <line x1="14" y1="11" x2="14" y2="17"></line>
//                                     </svg>
//                                     Delete
//                                   </button>
//                                   <Tooltip id={`delete-tooltip-${msg._id}`} />
//                                 </>
//                               )}
//                               <button
//                                 onClick={() => handleReply(msg)}
//                                 className={`w-full text-left px-3 py-1.5 text-sm hover:${
//                                   darkMode ? "bg-blue-700" : "bg-blue-200"
//                                 } flex items-center gap-2`}
//                                 data-tooltip-id={`reply-tooltip-${msg._id}`}
//                                 data-tooltip-content="Reply to Message"
//                               >
//                                 <svg
//                                   width="12"
//                                   height="12"
//                                   viewBox="0 0 24 24"
//                                   fill="none"
//                                   stroke="currentColor"
//                                   strokeWidth="2"
//                                   strokeLinecap="round"
//                                   strokeLinejoin="round"
//                                 >
//                                   <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
//                                 </svg>
//                                 Reply
//                               </button>
//                               <Tooltip id={`reply-tooltip-${msg._id}`} />
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ))
//               )}
//               {typingUsers.length > 0 && (
//                 <div className="text-sm italic text-gray-400 animate-pulse">
//                   {typingUsers.join(", ")} {typingUsers.length > 1 ? "are" : "is"}{" "}
//                   typing...
//                 </div>
//               )}
//               <div ref={messagesEndRef} />
//             </div>

//             <div className="flex gap-2 mt-auto">
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
//                 className={`flex-1 p-3 rounded-lg border ${
//                   darkMode
//                     ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400"
//                     : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
//                 } focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
//                 disabled={!user}
//               />
//               <button
//                 onClick={handleSendMessage}
//                 className={`relative bg-purple-700 text-white font-bold py-3 px-4 rounded-full transition-all duration-300 overflow-hidden group hover:bg-purple-500 ${
//                   !user ? "opacity-50 cursor-not-allowed" : ""
//                 }`}
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
//         {!user && (
//           <div className="flex flex-col items-center gap-4">
//             <p
//               className={`text-md mb-4 ${
//                 darkMode ? "text-gray-300" : "text-gray-700"
//               }`}
//             >
//               Please log in to chat.
//             </p>
//             <button
//               onClick={() => navigate("/login")}
//               className={`px-4 py-2 rounded-full ${
//                 darkMode
//                   ? "bg-purple-700 hover:bg-purple-600 text-white"
//                   : "bg-purple-500 hover:bg-purple-400 text-white"
//               } transition-all`}
//               data-tooltip-id="login-tooltip"
//               data-tooltip-content="Go to Login Page"
//             >
//               Go to Login
//             </button>
//             <Tooltip id="login-tooltip" />
//           </div>
//         )}
//       </div>

//       {notification && (
//         <div
//           className={`fixed top-20 right-6 p-4 rounded-lg shadow-lg max-w-sm ${
//             notification.type === "success"
//               ? darkMode
//                 ? "bg-green-800 text-green-300 border border-green-700"
//                 : "bg-green-100 text-green-700 border border-green-300"
//               : notification.type === "error"
//               ? darkMode
//                 ? "bg-red-800 text-red-300 border border-red-700"
//                 : "bg-red-100 text-red-700 border border-red-300"
//               : darkMode
//               ? "bg-gray-800 text-gray-300 border border-gray-700"
//               : "bg-white text-gray-700 border border-gray-300"
//           } animate-slide-in`}
//         >
//           <p>{notification.message}</p>
//         </div>
//       )}

//       {privateChatPrompt && (
//         <div
//           className={`fixed inset-0 flex items-center justify-center z-50 ${
//             darkMode ? "bg-black bg-opacity-70" : "bg-gray-900 bg-opacity-50"
//           }`}
//         >
//           <div
//             className={`p-6 rounded-2xl shadow-xl max-w-md text-center ${
//               darkMode
//                 ? "bg-gray-900 bg-opacity-90 border border-gray-700"
//                 : "bg-gray-200 bg-opacity-90 border border-gray-300"
//             }`}
//           >
//             <p
//               className={`text-lg mb-4 ${
//                 darkMode ? "text-gray-300" : "text-gray-700"
//               }`}
//             >
//               {privateChatPrompt.senderId} wants to start a private chat with you.
//               Accept?
//             </p>
//             <div className="flex justify-center gap-4">
//               <button
//                 onClick={handleAcceptPrivateChat}
//                 className={`px-4 py-2 rounded-full ${
//                   darkMode
//                     ? "bg-green-700 hover:bg-green-600 text-white"
//                     : "bg-green-500 hover:bg-green-400 text-white"
//                 } transition-all`}
//                 data-tooltip-id="accept-tooltip"
//                 data-tooltip-content="Accept Private Chat"
//               >
//                 Accept
//               </button>
//               <Tooltip id="accept-tooltip" />
//               <button
//                 onClick={handleRejectPrivateChat}
//                 className={`px-4 py-2 rounded-full ${
//                   darkMode
//                     ? "bg-red-700 hover:bg-red-600 text-white"
//                     : "bg-red-500 hover:bg-red-400 text-white"
//                 } transition-all`}
//                 data-tooltip-id="reject-tooltip"
//                 data-tooltip-content="Reject Private Chat"
//               >
//                 Reject
//               </button>
//               <Tooltip id="reject-tooltip" />
//             </div>
//           </div>
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

// export default ChatPage;

import React, { useState, useEffect, useRef } from "react";
import { Send, Edit, LogOut, Moon, Sun, Home, Search, Image, Pin, Forward } from "lucide-react";
import io from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import { v4 as uuidv4 } from "uuid";

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
  const [replyTo, setReplyTo] = useState(null);
  const [image, setImage] = useState(null);
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    document.documentElement.classList.toggle("dark", darkMode);
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

        const [messagesRes, pinnedRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/messages`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/pinned-message`),
        ]);
        setMessages(Array.isArray(messagesRes.data) ? messagesRes.data : []);
        setPinnedMessage(pinnedRes.data || null);
      } catch (err) {
        setNotification({ message: "Failed to initialize chat.", type: "error" });
      }
    };

    initialize();

    const socketHandlers = {
      connect: () => setIsOnline(true),
      connect_error: () => setIsOnline(false),
      disconnect: () => setIsOnline(false),
      receiveMessage: (msg) => {
        if (!msg.isPrivate) {
          setMessages((prev) => [...prev.filter(m => m._id !== msg._id), msg]);
        }
      },
      userList: ({ users }) => setUsers(users.filter(u => u !== user?.name)),
      typing: ({ senderId }) => setTypingUsers((prev) => [...new Set([...prev, senderId])]),
      stopTyping: ({ senderId }) => setTypingUsers((prev) => prev.filter(u => u !== senderId)),
      messageDeleted: ({ messageId }) => setMessages((prev) => prev.filter(m => m._id !== messageId)),
      messageEdited: ({ messageId, newText }) => {
        setMessages((prev) => prev.map(m => m._id === messageId ? { ...m, text: newText } : m));
      },
      messageReacted: ({ messageId, reaction, userId }) => {
        setMessages((prev) => prev.map(m => m._id === messageId ? { ...m, reactions: { ...m.reactions, [userId]: reaction } } : m));
      },
      privateChatRequest: ({ senderId, recipientId }) => {
        if (recipientId === user?.name) {
          setPrivateChatPrompt({ senderId, recipientId });
        }
      },
      privateChatAccepted: ({ senderId, recipientId }) => {
        if (senderId === user?.name || recipientId === user?.name) {
          navigate(`/private-chat/${senderId === user?.name ? recipientId : senderId}`);
        }
      },
      pinnedMessage: (msg) => setPinnedMessage(msg),
    };

    Object.entries(socketHandlers).forEach(([event, handler]) => socket.on(event, handler));

    return () => {
      Object.entries(socketHandlers).forEach(([event, handler]) => socket.off(event, handler));
      socket.disconnect();
    };
  }, [user?.name, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!user?.name || (!message.trim() && !image)) return;
    const newMessage = {
      senderId: user.name,
      text: message.trim(),
      timestamp: Date.now(),
      replyTo: replyTo?._id || null,
      image: image ? await uploadImage(image) : null,
    };
    socket.emit("sendMessage", newMessage);
    setMessage("");
    setImage(null);
    setReplyTo(null);
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload`, formData);
    return res.data.url;
  };

  const startPrivateChat = (recipientId) => {
    socket.emit("privateChatRequest", { senderId: user.name, recipientId });
  };

  const handleReact = (messageId, reaction) => {
    socket.emit("reactMessage", { messageId, reaction, userId: user.name });
  };

  const handlePinMessage = (msg) => {
    socket.emit("pinMessage", { message: msg });
  };

  const handleForwardMessage = (msg) => {
    const recipient = prompt("Enter recipient username:");
    if (recipient) {
      socket.emit("forwardMessage", { message: msg, recipientId: recipient });
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true });
  };

  const groupedMessages = () => {
    const groups = [];
    let currentDate = null;
    const filteredMessages = messages.filter(m => 
      m.text.toLowerCase().includes(messageSearchQuery.toLowerCase()) ||
      m.senderId.toLowerCase().includes(messageSearchQuery.toLowerCase())
    );

    filteredMessages.forEach((msg) => {
      const date = new Date(msg.timestamp).toLocaleDateString();
      if (date !== currentDate) {
        currentDate = date;
        groups.push({ date, messages: [] });
      }
      groups[groups.length - 1].messages.push(msg);
    });

    return groups;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-purple-950 from-white via-gray-100 to-purple-100 flex items-center justify-center p-6">
        <div className="p-6 rounded-2xl shadow-xl max-w-md text-center dark:bg-gray-900/30 dark:border-gray-700 bg-gray-200/80 border-gray-300">
          <p className="text-red-500 dark:text-red-300">Please log in to chat.</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-4 py-2 rounded-full bg-purple-500 hover:bg-purple-400 text-white dark:bg-purple-700 dark:hover:bg-purple-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-purple-950 from-white via-gray-100 to-purple-100 flex flex-col items-center justify-center p-6">
      <div className="fixed top-4 left-6 z-20 flex items-center gap-4">
        <span className="text-lg font-semibold dark:text-gray-300 text-gray-700">
          Welcome, <span className="dark:text-purple-300 text-purple-600">{user.name}</span>
        </span>
        <span className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-400" : "bg-red-400"}`}></span>
      </div>

      <div className="fixed top-4 right-10 z-20 flex gap-4">
        <button onClick={() => navigate("/homePage")} className="p-2 rounded-full dark:bg-gray-700 dark:hover:bg-gray-600 bg-blue-200 hover:bg-blue-300">
          <Home size={16} />
        </button>
        <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full dark:bg-gray-700 dark:hover:bg-gray-600 bg-yellow-200 hover:bg-yellow-300">
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button onClick={() => { localStorage.removeItem("user"); navigate("/login"); }} className="p-2 rounded-full dark:bg-red-600 dark:hover:bg-red-500 bg-red-400 hover:bg-red-300">
          <LogOut size={16} className="text-white" />
        </button>
      </div>

      <div className="p-6 rounded-2xl shadow-xl w-full max-w-2xl dark:bg-gray-900/30 dark:border-gray-700 bg-gray-200/80 border-gray-300 mt-16 flex flex-col h-[80vh]">
        <h1 className="text-3xl font-bold mb-4 dark:text-white text-gray-900">💬 Global Chat</h1>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search messages..."
            value={messageSearchQuery}
            onChange={(e) => setMessageSearchQuery(e.target.value)}
            className="w-full p-2 pl-8 rounded-lg border dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 border-gray-300 bg-white text-gray-900 placeholder-gray-500"
          />
          <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 dark:text-gray-400 text-gray-500" />
        </div>
        {pinnedMessage && (
          <div className="mb-4 p-2 bg-yellow-100 dark:bg-yellow-800 rounded-lg">
            <p className="text-sm">Pinned: {pinnedMessage.text}</p>
          </div>
        )}
        <div className="flex-1 overflow-y-auto mb-4 p-4 rounded-lg flex flex-col gap-3">
          {groupedMessages().map((group, i) => (
            <div key={i} className="mb-4">
              <div className="text-center text-xs dark:text-gray-400 text-gray-500">{group.date}</div>
              {group.messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.senderId === user.name ? "justify-end" : "justify-start"} mb-2`}
                  onContextMenu={() => setMenuOpen(msg._id)}
                >
                  <div className={`max-w-[65%] p-3 rounded-xl ${msg.senderId === user.name ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300"}`}>
                    {msg.replyTo && <div className="text-xs italic mb-1">Replying to: {messages.find(m => m._id === msg.replyTo)?.text}</div>}
                    <span className="text-sm">{msg.text}</span>
                    {msg.image && <img src={msg.image} alt="Attachment" className="max-w-full rounded-lg mt-2" />}
                    <div className="text-[10px] mt-1">{formatTimestamp(msg.timestamp)}</div>
                    {msg.reactions && (
                      <div className="flex gap-1 mt-1">
                        {Object.entries(msg.reactions).map(([u, r]) => <span key={u}>{r}</span>)}
                      </div>
                    )}
                    <div className={`absolute ${msg.senderId === user.name ? "right-0" : "left-0"} mt-2 w-32 rounded-lg shadow-lg dark:bg-gray-800 bg-white border dark:border-gray-700 border-gray-300 ${menuOpen === msg._id ? "opacity-100 visible" : "opacity-0 invisible"}`}>
                      <button onClick={() => handleReact(msg._id, "👍")} className="w-full text-left px-3 py-1.5 text-sm hover:bg-purple-700">React 👍</button>
                      <button onClick={() => handleReply(msg)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-blue-700">Reply</button>
                      <button onClick={() => handlePinMessage(msg)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-yellow-700">Pin</button>
                      <button onClick={() => handleForwardMessage(msg)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-green-700">Forward</button>
                      {msg.senderId === user.name && (
                        <>
                          <button onClick={() => socket.emit("editMessage", { messageId: msg._id, newText: prompt("Edit message:", msg.text), senderId: user.name })} className="w-full text-left px-3 py-1.5 text-sm hover:bg-purple-700">Edit</button>
                          <button onClick={() => socket.emit("deleteMessage", { messageId: msg._id, senderId: user.name })} className="w-full text-left px-3 py-1.5 text-sm hover:bg-red-700">Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
          {typingUsers.length > 0 && <div className="text-sm italic text-gray-400">Typing...</div>}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => setImage(e.target.files[0])}
            className="hidden"
          />
          <button onClick={() => fileInputRef.current.click()} className="p-3 rounded-full bg-gray-700 hover:bg-gray-600"><Image size={16} /></button>
          <input
            type="text"
            placeholder={replyTo ? `Replying to ${replyTo.text.slice(0, 20)}...` : "Type a message..."}
            value={message}
            onChange={(e) => { setMessage(e.target.value); socket.emit(e.target.value ? "typing" : "stopTyping", { senderId: user.name }); }}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-800 dark:text-white border-gray-300 bg-white text-gray-900"
          />
          <button onClick={handleSendMessage} className="p-3 rounded-full bg-purple-700 hover:bg-purple-500"><Send size={16} /></button>
        </div>
      </div>

      {privateChatPrompt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70">
          <div className="p-6 rounded-2xl dark:bg-gray-900/90 bg-gray-200/90">
            <p className="text-lg dark:text-gray-300 text-gray-700">{privateChatPrompt.senderId} wants to chat privately. Accept?</p>
            <div className="flex justify-center gap-4 mt-4">
              <button onClick={() => socket.emit("acceptPrivateChat", privateChatPrompt)} className="px-4 py-2 rounded-full bg-green-700 hover:bg-green-600 text-white">Accept</button>
              <button onClick={() => socket.emit("rejectPrivateChat", privateChatPrompt)} className="px-4 py-2 rounded-full bg-red-700 hover:bg-red-600 text-white">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;
