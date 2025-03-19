import React, { useEffect, useState } from "react";
import "../src/App.css";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

function Update() {
  const {email} = useParams()

  const navigate = useNavigate();
  const {
    handleSubmit,
    formState: { errors },
    reset, 
  } = useForm();

  const [submit, setSubmit] = useState(false);
  const [values, setValues] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/users/read/${email}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        console.log(data);

        setValues({ name: data.name, email: data.email });


      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []); 

  // console.log(values);

  const doneSubmit = async (values) => {
    reset();

    try {
      const response = await fetch(`http://localhost:3000/api/users/update/${email}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        alert("Name Edited Successfully!");
        setSubmit(true);
        reset();
        navigate("/");
      } else {
        throw new Error(responseData.message || "Something went wrong");
      }
    } catch (err) {
      console.log(err);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-gray-200">
      <div className="max-w-lg m-5 p-4 text-center bg-white rounded-lg shadow-2xl shadow-black">
        <h1 className="text-blue-500 text-2xl pb-3 font-bold">Edit Name</h1>
        <form className="flex flex-col gap-4 w-70" onSubmit={handleSubmit(doneSubmit)}>

          <input
            className="p-3 border-2 rounded-md"

            value={values.name || ""}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
          />




          <input
            className="p-3 border-2 rounded-md"
            value={values.email || ""}
            onChange={(e) => setValues({ ...values, email: e.target.value })
            }
          />

          <button
            type="submit"
            onClick={() => doneSubmit(values)}
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