import React, { useEffect, useState } from "react";
import "../App.css"

function Data() {
    const [user, setUser] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/api/read") // Fix API URL if needed
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                setUser(data);
            })
            .catch((error) => console.error("Fetch error:", error));
    }, []);

    useEffect(() => {
        console.log(user); // Logs updated state after it changes
    }, [user]); // Logs whenever `user` updates

    return (
        <div className="card grid lg:grid-cols-3 gap-5 grid-cols-2">
            {user.length > 0 ? (
                user.map((item) => (
                    <div key={item.email} className="new flex flex-col justify-center text-center">
                        
                            <h1 className="text-3xl">{item.name}</h1>
                            <h3>{item.email}</h3>
                    
                        
                    </div>
                ))
            ) : (
                <p>No users found.</p>
            )}
        </div>
    );
}

export default Data;