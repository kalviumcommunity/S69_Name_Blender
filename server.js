const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Route to test server
app.get('/ping', (req, res) => {
    res.send('pong');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
