const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');
const routes = require('./routes/routes');
const cors = require('cors')

require("dotenv").config();
app.use(cors())
app.use(express.json());
app.use('/api', routes);

let a= false;


mongoose.connect(process.env.DB_URL)
.then(()=>{
    console.log("Connected to database")
    a = true;
})
.catch((err)=>console.log("Error connecting to database"+err))

app.get("/",(req, res)=>{
    if(a){
        res.send("Connected to database")    
    }else(res.send("Error connecting to database"))
})



// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

