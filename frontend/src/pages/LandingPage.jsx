import React, { useState } from "react";

function LandingPage() {
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode

  return (
    <div className={`${darkMode ? "bg-black text-white" : "bg-white text-black"} flex flex-col items-center justify-center min-h-screen p-6 transition-colors duration-300`}>
      {/* 🌗 Toggle Button */}
    <div className="fixed top-4 right-10"><button
        onClick={() => setDarkMode(!darkMode)}
        className="bg-gray-800 text-white dark:bg-white dark:text-black px-3 py-2 rounded-full shadow-md transition"
      >
        {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
      </button></div>  

      {/* 🌟 Header */}
      <header className="text-center">
        <h1 className="text-6xl font-extrabold drop-shadow-lg hover:text-blue-500 transition-colors duration-300">✨ Name Blender ✨</h1>
        <p className="text-lg mt-4">Create fun & unique name blends in seconds!</p>
      </header>

      {/* 🚀 Hero Section */}
      <div className="mt-10 text-center">
        <p className="text-xl font-light max-w-lg">
          Ever wondered what your name would look like blended with someone else’s? Try it out and discover fun, creative name fusions!
        </p>
        <button className="mt-6 bg-white text-purple-700 font-bold py-3 px-6 rounded-full text-lg hover:bg-purple-200 transition">
          🚀 Try Now
        </button>
      </div>

      {/* 📝 About Section */}
      <section className={`mt-16 p-6 rounded-2xl shadow-lg max-w-lg text-center transition-all duration-300 ${darkMode ? "bg-white bg-opacity-20 text-black" : "bg-gray-200 text-gray-900"}`}>
        <h2 className="text-2xl font-bold">About Name Blender</h2>
        <p className="text-md mt-2">
          Name Blender is a fun tool that combines two names to generate a unique, blended name. Perfect for friends, couples, or just for fun!
        </p>
      </section>

      {/* 📩 Footer */}
      <footer className="mt-12 text-center text-sm opacity-75">
        <p>💌 Contact us: <a href="mailto:support@nameblender.com" className="underline">support@nameblender.com</a></p>
      </footer>
    </div>
  );
}

export default LandingPage;
