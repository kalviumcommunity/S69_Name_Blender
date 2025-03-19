import React, { useState } from "react";

function SignUpPage() {
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const validateForm = () => {
    let errors = {};
    if (formData.name.trim().length < 8) {
      errors.name = "Name must be at least 8 characters long.";
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email format.";
    }
    if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage("🎉 Signup successful! Welcome aboard!");
        setFormData({ name: "", email: "", password: "" }); // Reset form on success
      } else {
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setMessage("Error connecting to server. Please try again later.");
    }

    setLoading(false);
  };

  return (
    <div className={`${darkMode ? "bg-black text-white" : "bg-white text-black"} flex flex-col items-center justify-center min-h-screen p-6 transition-colors duration-300`}>
      {/* 🌗 Toggle Button */}
      <div className="fixed top-4 right-10">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="bg-gray-800 text-white dark:bg-white dark:text-black px-3 py-2 rounded-full shadow-md transition"
        >
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* 📝 Signup Card */}
      <div className={`p-8 rounded-2xl shadow-lg w-full max-w-md text-center transition-all duration-300 ${darkMode ? "bg-white bg-opacity-20 text-black" : "bg-gray-200 text-gray-900"}`}>
        <h2 className="text-3xl font-bold">Create an Account</h2>
        <p className="text-md mt-2">Join us and start blending names today!</p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}

          <button type="submit" className="bg-purple-700 text-white font-bold py-3 px-6 rounded-full text-lg hover:bg-purple-500 transition" disabled={loading}>
            {loading ? "⏳ Signing Up..." : "🚀 Sign Up"}
          </button>
        </form>

        {message && <p className="text-sm mt-4 opacity-75 text-red-500">{message}</p>}

        <p className="text-sm mt-4 opacity-75">
          Already have an account? <a href="#" className="underline">Log in</a>
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;
