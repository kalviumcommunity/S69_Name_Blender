// const express = require("express");
// const router = express.Router();
// const Message = require("../models/Message");
// const User = require("../models/User");
// const bcrypt = require("bcryptjs");
// const userController = require("../controllers/itemController");

// router.get("/read", userController.read);
// router.put("/update/:email", userController.update);
// router.delete("/delete/:email", userController.delete);

// router.get("/messages", async (req, res) => {
//   try {
//     const messages = await Message.find({ isPrivate: false });
//     res.json(messages);
//   } catch (err) {
//     console.error("Error fetching public messages:", err);
//     res.status(500).send("Server error");
//   }
// });

// router.get("/private-messages/:sender/:recipient", async (req, res) => {
//   const { sender, recipient } = req.params;
//   try {
//     const messages = await Message.find({
//       isPrivate: true,
//       $or: [
//         { senderId: sender, recipientId: recipient },
//         { senderId: recipient, recipientId: sender },
//       ],
//     });
//     res.json(messages);
//   } catch (err) {
//     console.error("Error fetching private messages:", err);
//     res.status(500).send("Server error");
//   }
// });

// router.post("/register", async (req, res) => {
//   const { name, email, password } = req.body;
//   try {
//     if (!email || !name || !password) {
//       return res.status(400).json({ message: "Name, email, and password are required" });
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "Email already in use" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({ name, email, password: hashedPassword });
//     await newUser.save();

//     res.status(201).json({ message: "User registered successfully", user: { name, email } });
//   } catch (err) {
//     console.error("Error during registration:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// router.post("/login", userController.login);

// module.exports = router;



const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const userController = require("../controllers/itemController");

router.get("/read", userController.read);
router.put("/update/:email", userController.update);
router.delete("/delete/:email", userController.delete);

router.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find({ isPrivate: false });
    res.json(messages);
  } catch (err) {
    console.error("Error fetching public messages:", err);
    res.status(500).send("Server error");
  }
});

router.get("/private-messages/:sender/:recipient", async (req, res) => {
  const { sender, recipient } = req.params;
  try {
    const messages = await Message.find({
      isPrivate: true,
      $or: [
        { senderId: sender, recipientId: recipient },
        { senderId: recipient, recipientId: sender },
      ],
      $or: [
        { expiresAt: { $exists: false } }, // Messages not yet marked for expiration
        { expiresAt: { $gt: new Date() } }, // Messages not yet expired
      ],
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error("Error fetching private messages:", err);
    res.status(500).send("Server error");
  }
});

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!email || !name || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully", user: { name, email } });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/login", userController.login);

module.exports = router;