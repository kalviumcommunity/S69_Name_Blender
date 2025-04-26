// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Eye, EyeOff } from "lucide-react";

// function LoginPage() {
//   const [darkMode, setDarkMode] = useState(true);
//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   const navigate = useNavigate();

//   const validateForm = () => {
//     let errors = {};
//     if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       errors.email = "Invalid email format.";
//     }
//     if (formData.password.length < 6) {
//       errors.password = "Password must be at least 6 characters.";
//     }
//     setErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage("");

//     if (!validateForm()) return;

//     setLoading(true);

//     try {
//       const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData), // Already { email, password }
//       });

//       const data = await response.json();
//       console.log("Login response:", data); // Debug log

//       if (response.ok) {
//         setMessage("✨ Login successful!");
//         localStorage.setItem("user", JSON.stringify(data.user || {}));
//         setFormData({ email: "", password: "" });

//         setTimeout(() => {
//           navigate("/homePage");
//         }, 1000);
//       } else {
//         setMessage(data.message || "Invalid credentials. Try again.");
//       }
//     } catch (error) {
//       setMessage("🌋 Server error. Please try again later.");
//       console.error("Login error:", error);
//     }

//     setLoading(false);
//   };

//   return (
//     <div
//       className={`${
//         darkMode ? "bg-gradient-to-br from-gray-900 via-black to-purple-950" : "bg-gradient-to-br from-white via-gray-100 to-purple-100"
//       } flex flex-col items-center justify-center min-h-screen p-6 transition-all duration-500 relative overflow-hidden`}
//     >
//       <div className="absolute inset-0 pointer-events-none">
//         <div className={`w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse absolute ${darkMode ? "top-10 left-10" : "top-20 right-20"}`}></div>
//         <div className={`w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse absolute ${darkMode ? "bottom-20 right-20" : "bottom-10 left-10"} delay-1000`}></div>
//       </div>

//       <div className="fixed top-4 right-10 z-20">
//         <button
//           onClick={() => setDarkMode(!darkMode)}
//           className={`relative w-16 h-8 rounded-full shadow-md transition-all duration-300 flex items-center justify-between px-1 ${
//             darkMode ? "bg-gray-800" : "bg-yellow-300"
//           }`}
//         >
//           <span className={`absolute w-6 h-6 rounded-full bg-white transform transition-transform duration-300 ${darkMode ? "translate-x-0" : "translate-x-8"}`}></span>
//           <span className="text-sm text-white z-10">🌙</span>
//           <span className="text-sm text-black z-10">🌞</span>
//         </button>
//       </div>

//       <div
//         className={`p-8 rounded-2xl shadow-xl w-full max-w-md text-center transition-all duration-300 backdrop-blur-md ${
//           darkMode ? "bg-gray-900 bg-opacity-30 border border-gray-700" : "bg-gray-200 bg-opacity-80 border border-gray-300"
//         } relative z-10`}
//       >
//         <h2 className={`text-3xl font-bold tracking-tight animate-fade-in ${darkMode ? "text-white" : "text-gray-900"}`}>Welcome Back</h2>
//         <p className={`text-md mt-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Unlock your blending journey</p>

//         <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit}>
//           <input
//             type="email"
//             name="email"
//             placeholder="Email"
//             value={formData.email}
//             onChange={handleChange}
//             className={`w-full p-3 rounded-lg border ${
//               darkMode ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
//             } focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
//             required
//           />
//           {errors.email && <p className={`text-sm ${darkMode ? "text-red-300" : "text-red-500"} animate-slide-up`}>{errors.email}</p>}

//           <div className="relative">
//             <input
//               type={showPassword ? "text" : "password"}
//               name="password"
//               placeholder="Password"
//               value={formData.password}
//               onChange={handleChange}
//               className={`w-full p-3 rounded-lg border ${
//                 darkMode ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
//               } focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all pr-10`}
//               required
//             />
//             <span
//               onClick={() => setShowPassword(!showPassword)}
//               className={`absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer ${
//                 darkMode ? "text-gray-300 hover:text-purple-300" : "text-gray-600 hover:text-purple-500"
//               } transition`}
//             >
//               {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//             </span>
//           </div>
//           {errors.password && <p className={`text-sm ${darkMode ? "text-red-300" : "text-red-500"} animate-slide-up`}>{errors.password}</p>}

//           <button
//             type="submit"
//             className={`relative bg-purple-700 text-white font-bold py-3 px-6 rounded-full text-lg transition-all duration-300 overflow-hidden group ${
//               loading ? "cursor-not-allowed opacity-75" : "hover:bg-purple-500"
//             }`}
//             disabled={loading}
//           >
//             <span className="relative z-10">
//               {loading ? (
//                 <span className="flex items-center justify-center">
//                   <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"></path>
//                   </svg>
//                   Logging In...
//                 </span>
//               ) : (
//                 "Login"
//               )}
//             </span>
//             {!loading && (
//               <span className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-30 transition-opacity duration-300 transform -skew-x-12"></span>
//             )}
//           </button>
//         </form>

//         {message && (
//           <p
//             className={`text-sm mt-4 animate-fade-in ${
//               message.includes("successful") ? (darkMode ? "text-green-300" : "text-green-500") : (darkMode ? "text-red-300" : "text-red-500")
//             }`}
//           >
//             {message}
//           </p>
//         )}

//         <p className={`text-sm mt-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
//           Don’t have an account?{" "}
//           <Link
//             to="/signup"
//             className={`underline ${darkMode ? "text-purple-300 hover:text-purple-400" : "text-purple-600 hover:text-purple-800"} transition`}
//           >
//             Sign up
//           </Link>
//         </p>
//       </div>

//       <style jsx>{`
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
//         @keyframes slideUp {
//           from { transform: translateY(10px); opacity: 0; }
//           to { transform: translateY(0); opacity: 1; }
//         }
//         .animate-fade-in {
//           animation: fadeIn 0.5s ease-in-out;
//         }
//         .animate-slide-up {
//           animation: slideUp 0.3s ease-in-out;
//         }
//       `}</style>
//     </div>
//   );
// }

// export default LoginPage;




import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

function LoginPage() {
  // Initialize darkMode from localStorage, default to true if not set
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode !== null ? JSON.parse(savedMode) : true;
  });
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Save darkMode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const validateForm = () => {
    let errors = {};
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email format.";
    }
    if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
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

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (response.ok) {
        setMessage("✨ Login successful!");
        localStorage.setItem("user", JSON.stringify(data.user || {}));
        setFormData({ email: "", password: "" });

        setTimeout(() => {
          navigate("/homePage");
        }, 1000);
      } else {
        setMessage(data.message || "Invalid credentials. Try again.");
      }
    } catch (error) {
      setMessage("🌋 Server error. Please try again later.");
      console.error("Login error:", error);
    }

    setLoading(false);
  };

  return (
    <div
      className={`${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-black to-purple-950"
          : "bg-gradient-to-br from-white via-gray-100 to-purple-100"
      } flex flex-col items-center justify-center min-h-screen p-6 transition-all duration-500 relative overflow-hidden`}
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

      <div className="fixed top-4 right-10 z-20">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`relative w-16 h-8 rounded-full shadow-md transition-all duration-300 flex items-center justify-between px-1 ${
            darkMode ? "bg-gray-800" : "bg-yellow-300"
          }`}
        >
          <span
            className={`absolute w-6 h-6 rounded-full bg-white transform transition-transform duration-300 ${
              darkMode ? "translate-x-0" : "translate-x-8"
            }`}
          ></span>
          <span className="text-sm text-white z-10">🌙</span>
          <span className="text-sm text-black z-10">🌞</span>
        </button>
      </div>

      <div
        className={`p-8 rounded-2xl shadow-xl w-full max-w-md text-center transition-all duration-300 backdrop-blur-md ${
          darkMode
            ? "bg-gray-900 bg-opacity-30 border border-gray-700"
            : "bg-gray-200 bg-opacity-80 border border-gray-300"
        } relative z-10`}
      >
        <h2
          className={`text-3xl font-bold tracking-tight animate-fade-in ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Welcome Back
        </h2>
        <p
          className={`text-md mt-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
        >
          Unlock your blending journey
        </p>

        <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-3 rounded-lg border ${
              darkMode
                ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400"
                : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
            } focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
            required
          />
          {errors.email && (
            <p
              className={`text-sm ${
                darkMode ? "text-red-300" : "text-red-500"
              } animate-slide-up`}
            >
              {errors.email}
            </p>
          )}

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border ${
                darkMode
                  ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400"
                  : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
              } focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all pr-10`}
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer ${
                darkMode
                  ? "text-gray-300 hover:text-purple-300"
                  : "text-gray-600 hover:text-purple-500"
              } transition`}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>
          {errors.password && (
            <p
              className={`text-sm ${
                darkMode ? "text-red-300" : "text-red-500"
              } animate-slide-up`}
            >
              {errors.password}
            </p>
          )}

          <button
            type="submit"
            className={`relative bg-purple-700 text-white font-bold py-3 px-6 rounded-full text-lg transition-all duration-300 overflow-hidden group ${
              loading ? "cursor-not-allowed opacity-75" : "hover:bg-purple-500"
            }`}
            disabled={loading}
          >
            <span className="relative z-10">
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                    ></path>
                  </svg>
                  Logging In...
                </span>
              ) : (
                "Login"
              )}
            </span>
            {!loading && (
              <span className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-30 transition-opacity duration-300 transform -skew-x-12"></span>
            )}
          </button>
        </form>

        {message && (
          <p
            className={`text-sm mt-4 animate-fade-in ${
              message.includes("successful")
                ? darkMode
                  ? "text-green-300"
                  : "text-green-500"
                : darkMode
                ? "text-red-300"
                : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        <p
          className={`text-sm mt-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
        >
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className={`underline ${
              darkMode
                ? "text-purple-300 hover:text-purple-400"
                : "text-purple-600 hover:text-purple-800"
            } transition`}
          >
            Sign up
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default LoginPage;
