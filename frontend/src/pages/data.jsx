import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Data() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:3000/api/read", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to fetch users. Please check if the server is running.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10">
        <svg className="animate-spin h-8 w-8 mx-auto text-purple-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
        </svg>
        <p className="mt-2 text-gray-600">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        <p>Error: {error}</p>
        <button
          onClick={fetchUsers}
          className="mt-4 bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-5 grid-cols-2 p-6">
      {users.length > 0 ? (
        users.map((item) => (
          <div
            key={item.email}
            className="flex flex-col justify-center text-center p-4 border rounded-md shadow-md bg-white hover:shadow-lg transition"
          >
            <h1 className="text-3xl font-bold text-gray-800">{item.name}</h1>
            <h3 className="text-lg text-gray-600">{item.email}</h3>
            <span className="mt-4 flex justify-center gap-2">
              <Link to={`/update/${encodeURIComponent(item.email)}`}>
                <button className="bg-amber-300 border-2 rounded-md p-1 hover:bg-amber-400 transition">
                  Edit Name
                </button>
              </Link>
              <Link to={`/delete/${encodeURIComponent(item.email)}`}>
                <button className="bg-red-400 border-2 rounded-md p-1 hover:bg-red-500 transition">
                  Delete
                </button>
              </Link>
            </span>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 col-span-full">No users found.</p>
      )}
    </div>
  );
}

export default Data;