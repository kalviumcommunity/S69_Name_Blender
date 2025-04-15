import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import { RefreshCw, Share2, Moon, Sun } from "lucide-react";

function blendNames(name1, name2) {
  const half1 = name1.slice(0, Math.ceil(name1.length / 2));
  const half2 = name2.slice(Math.floor(name2.length / 2));
  return half1 + half2;
}

function HomePage() {
  const [darkMode, setDarkMode] = useState(true);
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [blendedName, setBlendedName] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
      }
    }
  }, []);

  const handleBlend = () => {
    if (name1 && name2) {
      const blended = blendNames(name1.trim(), name2.trim());
      setBlendedName(blended);
      setShareMessage("");
    } else {
      setBlendedName("Please enter both names.");
      setShareMessage("");
    }
  };

  const handleReset = () => {
    setName1("");
    setName2("");
    setBlendedName("");
    setShareMessage("");
  };

  const handleShare = async () => {
    const shareText = `Blended name: ${blendedName}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Name Blender Result",
          text: shareText,
          url: window.location.href,
        });
        setShareMessage("Shared successfully!");
      } catch (error) {
        console.error("Share failed:", error);
        setShareMessage("Failed to share. Try copying instead.");
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setShareMessage("Copied to clipboard!");
      } catch (error) {
        console.error("Clipboard copy failed:", error);
        setShareMessage("Failed to copy. Please try again.");
      }
    }
    setTimeout(() => setShareMessage(""), 2000);
  };

  return (
    <div
      className={`${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-black to-purple-950"
          : "bg-gradient-to-br from-white via-gray-100 to-purple-100"
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

      {user && user.name && (
        <div className="fixed top-4 left-6 z-20">
          <span
            className={`text-lg font-semibold ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Hello🖐️{" "}
            <span
              className={`${
                darkMode
                  ? "animate-color-flow-dark hover:text-purple-300"
                  : "animate-color-flow-light hover:text-purple-600"
              } transition`}
            >
              {user.name}
            </span>
          </span>
        </div>
      )}

      <div className="fixed top-4 right-10 z-20">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-full ${
            darkMode
              ? "bg-gray-700 hover:bg-gray-600 text-white"
              : "bg-yellow-200 hover:bg-yellow-300 text-gray-900"
          } transition-all`}
          data-tooltip-id="mode-tooltip"
          data-tooltip-content={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <Tooltip id="mode-tooltip" />
      </div>

      <div
        className={`p-8 rounded-2xl shadow-xl w-full max-w-md text-center transition-all duration-300 backdrop-blur-md ${
          darkMode
            ? "bg-gray-900 bg-opacity-30 border border-gray-700"
            : "bg-gray-200 bg-opacity-80 border border-gray-300"
        } relative z-10`}
      >
        <h1
          className={`text-4xl font-bold mb-2 animate-fade-in ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Name Blender
        </h1>
        <p
          className={`text-md mb-6 ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Blend two names into one unique combo!
        </p>

        <input
          type="text"
          placeholder="Enter first name"
          value={name1}
          onChange={(e) => setName1(e.target.value)}
          className={`w-full mb-4 p-3 rounded-lg border ${
            darkMode
              ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400"
              : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
          } focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
        />

        <input
          type="text"
          placeholder="Enter second name"
          value={name2}
          onChange={(e) => setName2(e.target.value)}
          className={`w-full mb-4 p-3 rounded-lg border ${
            darkMode
              ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400"
              : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
          } focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
        />

        <button
          onClick={handleBlend}
          className={`w-full relative bg-purple-700 text-white font-bold py-3 rounded-full text-lg transition-all duration-300 overflow-hidden group hover:bg-purple-500 mb-3`}
        >
          <span className="relative z-10">🔮 Blend Names</span>
          <span className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-30 transition-opacity duration-300 transform -skew-x-12"></span>
        </button>

        <button
          onClick={handleReset}
          className={`flex items-center justify-center mx-auto gap-2 text-sm ${
            darkMode
              ? "text-gray-300 hover:text-purple-300"
              : "text-gray-700 hover:text-purple-500"
          } transition`}
        >
          <RefreshCw size={16} />
          Reset
        </button>

        {blendedName && (
          <div className="mt-6">
            <div
              className={`text-xl font-bold ${
                blendedName.includes("Please")
                  ? darkMode
                    ? "text-red-300"
                    : "text-red-500"
                  : darkMode
                  ? "text-purple-300"
                  : "text-purple-600"
              } animate-fade-in`}
            >
              💡 Result: <span className="underline">{blendedName}</span>
            </div>
            {!blendedName.includes("Please") && (
              <button
                onClick={handleShare}
                className={`mt-3 flex items-center justify-center mx-auto gap-2 relative bg-purple-600 text-white py-2 px-4 rounded-full text-sm transition-all duration-300 overflow-hidden group hover:bg-purple-400`}
              >
                <span className="relative z-10">
                  <Share2 size={16} className="inline mr-1" /> Share
                </span>
                <span className="absolute inset-0 bg-purple-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300 transform -skew-x-12"></span>
              </button>
            )}
          </div>
        )}

        {shareMessage && (
          <p
            className={`text-sm mt-2 animate-fade-in ${
              shareMessage.includes("successfully") ||
              shareMessage.includes("Copied")
                ? darkMode
                  ? "text-green-300"
                  : "text-green-500"
                : darkMode
                ? "text-red-300"
                : "text-red-500"
            }`}
          >
            {shareMessage}
          </p>
        )}

        <p
          className={`mt-8 text-sm ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          <Link
            to="/ChatPage"
            className={`underline ${
              darkMode
                ? "text-purple-300 hover:text-purple-400"
                : "text-purple-600 hover:text-purple-800"
            }`}
          >
            <button
              className={`w-full relative bg-purple-700 text-white font-bold py-3 rounded-full text-lg transition-all duration-300 overflow-hidden group hover:bg-purple-500 mb-3`}
            >
              <span className="relative z-10">Chat with Everyone</span>
              <span className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-30 transition-opacity duration-300 transform -skew-x-12"></span>
            </button>
          </Link>
        </p>
      </div>

      <style jsx>{`
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

export default HomePage;