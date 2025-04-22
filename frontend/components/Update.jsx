import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

function Update() {
  const { email } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();
  const [values, setValues] = useState({ name: "", email: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/read`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        const user = Array.isArray(data) ? data.find((u) => u.email === email) : null;
        if (user) {
          setValues({ name: user.name, email: user.email });
          setValue("name", user.name);
          setValue("email", user.email);
        } else {
          console.error("User not found");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchData();
  }, [email, setValue]);

  const doneSubmit = async (data) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/update/${encodeURIComponent(email)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: values.email }),
      });

      const responseData = await response.json();
      if (response.ok) {
        alert("Name Edited Successfully!");
        reset();
        navigate("/");
      } else {
        throw new Error(responseData.message || "Failed to update name");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update name");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="max-w-lg m-5 p-4 text-center bg-white rounded-lg shadow-2xl">
        <h1 className="text-blue-500 text-2xl pb-3 font-bold">Edit Name</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(doneSubmit)}>
          <input
            {...register("name", { required: "Name is required" })}
            className="p-3 border-2 rounded-md"
            placeholder="New Name"
          />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
          <input
            {...register("email")}
            className="p-3 border-2 rounded-md"
            value={values.email}
            readOnly
          />
          <button
            type="submit"
            className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 h-10 rounded-md hover:bg-blue-600 text-white"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default Update;
