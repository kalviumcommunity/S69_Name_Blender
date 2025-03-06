const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/create',User.create);
router.get('/users/read/:email?',User.read)
router.put('/users/update/:email?',User.update)
router.delete('/users/delete/:email?',User.delete)

module.exports = router;
