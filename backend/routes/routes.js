const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/create',User.create);
router.get('/read',User.read)
router.put('/update',User.update)
router.delete('/delete',User.delete)

module.exports = router;
