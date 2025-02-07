const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const mongoose = require('mongoose');
const routes = require('./routes/routes');

require("dotenv").config();

let a= false;


mongoose.connect(process.env.DB_URL)
.then(()=>{console.log("Connected to database")
    a = true;
})
.catch(()=>{console.log("Error connecting to database")})

app.get("/",(req, res)=>{
    if(a){
        res.send("Connected to database")    
    }else(res.send("Error connecting to database"))
})


app.use(express.json());
app.use('/api', routes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

