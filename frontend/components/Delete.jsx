import React from 'react'
import { useState,useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';



function Delete() {
    const navigate = useNavigate()
    const [values, setValues] = useState({
        name: "",
        email: "",
      });
      const {email} = useParams()

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await fetch(`http://localhost:3000/api/users/read/${email}`, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();
            // console.log(data);

            setValues({ name: data.name, email: email });


          } catch (err) {
            console.log(err);
          }
        };
        fetchData();
      }, []); 


      const handleDelete = async () => {


        try {
          const response = await fetch(`http://localhost:3000/api/users/delete/${email}`, {
            method: "Delete",
            headers: { "Content-Type": "application/json" },
          });

          const responseData = await response.json();

          if (response.ok) {
            alert("Deleted Successfully!");
            navigate("/");
          } else {
            throw new Error(responseData.message || "Something went wrong");
          }
        } catch (err) {
          console.log(err);
        }
      };

      const handleNoDelete = ()=>{
        navigate("/")
      }

  return (
    <div className='place-content-center justify-center m-50'>
      <h1>Do you want to Delete?</h1>
      {values && <h2>{JSON.stringify(values)}</h2>}
      <button onClick={handleDelete}>Yes</button>
      <br/>
      <button onClick={handleNoDelete}>No</button>
    </div>
  )
}

export default Delete