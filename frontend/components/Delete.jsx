import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Delete() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: "", email: "" });
  const { email } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/read", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        const user = Array.isArray(data) ? data.find((u) => u.email === email) : null;
        if (user) {
          setValues({ name: user.name, email: user.email });
        } else {
          console.error("User not found");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchData();
  }, [email]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/delete/${email}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const responseData = await response.json();
      if (response.ok) {
        alert("Deleted Successfully!");
        navigate("/");
      } else {
        throw new Error(responseData.message || "Failed to delete user");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete user");
    }
  };

  const handleNoDelete = () => {
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Do you want to Delete?</h1>
        {values.name && values.email && (
          <h2 className="mb-4">Name: {values.name}, Email: {values.email}</h2>
        )}
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white py-2 px-4 rounded-md mr-2 hover:bg-red-600"
        >
          Yes
        </button>
        <button
          onClick={handleNoDelete}
          className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
        >
          No
        </button>
      </div>
    </div>
  );
}

export default Delete;