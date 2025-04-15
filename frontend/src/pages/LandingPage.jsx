import React, { useState } from "react";
import { Link } from "react-router-dom";

function LandingPage() {
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode

  return (
    <div
      className={`${
        darkMode ? "bg-gradient-to-br from-gray-900 via-black to-purple-950" : "bg-gradient-to-br from-white via-gray-100 to-purple-100"
      } flex flex-col items-center justify-center min-h-screen p-6 transition-all duration-500 relative overflow-hidden`}
    >
      {/* 🌌 Subtle Animated Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse absolute ${darkMode ? "top-10 left-10" : "top-20 right-20"}`}></div>
        <div className={`w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse absolute ${darkMode ? "bottom-20 right-20" : "bottom-10 left-10"} delay-1000`}></div>
      </div>

      {/* 🌗 Unique Dark Mode Toggle */}
      <div className="fixed top-4 right-10 z-20">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`relative w-16 h-8 rounded-full shadow-md transition-all duration-300 flex items-center justify-between px-1 ${
            darkMode ? "bg-gray-800" : "bg-yellow-300"
          }`}
        >
          <span className={`absolute w-6 h-6 rounded-full bg-white transform transition-transform duration-300 ${darkMode ? "translate-x-0" : "translate-x-8"}`}></span>
          <span className="text-sm text-white z-10">🌙</span>
          <span className="text-sm text-black z-10">🌞</span>
        </button>
      </div>

      {/* 🌟 Header */}
      <header className="text-center relative z-10">
        <h1
          className={`text-6xl font-extrabold drop-shadow-lg transition-colors duration-300 animate-fade-in ${
            darkMode ? "text-white hover:text-purple-300" : "text-gray-900 hover:text-purple-600"
          }`}
        >
          ✨ Name Blender ✨
        </h1>
        <p className={`text-lg mt-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Create fun & unique name blends in seconds!</p>
      </header>

      {/* 🚀 Hero Section */}
      <div className="mt-10 text-center relative z-10">
        <p className={`text-xl font-light max-w-lg ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
          Ever wondered what your name would look like blended with someone else’s? Try it out and discover fun, creative name fusions!
        </p>
        <Link to="/signup">
          <button
            className={`mt-6 relative bg-purple-700 text-white font-bold py-3 px-6 rounded-full text-lg transition-all duration-300 overflow-hidden group hover:bg-purple-500`}
          >
            <span className="relative z-10">🚀 Try Now</span>
            <span className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-30 transition-opacity duration-300 transform -skew-x-12"></span>
          </button>
        </Link>
      </div>

      {/* 📝 About Section */}
      <section
        className={`mt-16 p-6 rounded-2xl shadow-lg max-w-lg text-center transition-all duration-300 backdrop-blur-md relative z-10 ${
          darkMode ? "bg-gray-900 bg-opacity-30 border border-gray-700" : "bg-gray-200 bg-opacity-80 border border-gray-300"
        }`}
      >
        <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>About Name Blender</h2>
        <p className={`text-md mt-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
          Name Blender is a fun tool that combines two names to generate a unique, blended name. Perfect for friends, couples, or just for fun!
        </p>
      </section>

      {/* 📖 About Us Section */}
      <section
        className={`mt-12 p-6 rounded-2xl shadow-lg max-w-lg text-center transition-all duration-300 backdrop-blur-md relative z-10 ${
          darkMode ? "bg-gray-900 bg-opacity-30 border border-gray-700" : "bg-gray-200 bg-opacity-80 border border-gray-300"
        }`}
      >
        <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>About Us</h2>
        <p className={`text-md mt-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
          We are a team of developers passionate about creativity and technology. Our mission is to bring fun and engaging experiences through simple yet powerful tools.
        </p>
      </section>

      

      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default LandingPage;