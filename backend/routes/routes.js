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
//       $or: [
//         { expiresAt: { $exists: false } }, // Messages not yet marked for expiration
//         { expiresAt: { $gt: new Date() } }, // Messages not yet expired
//       ],
//     }).sort({ timestamp: 1 });
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
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

// Configure Multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/audios/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /webm|mp3|wav/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only audio files (webm, mp3, wav) are allowed"));
  },
});

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
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } },
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

router.post("/upload-audio", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No audio file uploaded" });
    }
    const audioUrl = `${req.protocol}://${req.get("host")}/uploads/audios/${req.file.filename}`;
    res.status(200).json({ audioUrl });
  } catch (err) {
    console.error("Error uploading audio:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;