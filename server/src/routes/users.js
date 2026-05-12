const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Message = require('../models/Message');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Username validation function
const validateUsername = (username) => {
  const minLength = 4;
  const hasNumber = /\d/.test(username);
  return username && username.length >= minLength && hasNumber;
};

router.post('/signup', upload.single('image'), async (req, res) => {
  const { username, password, firstName, lastName, gender, age, avatar } = req.body;
  const image = req.file;

  console.log('Signup data:', { username, password, firstName, lastName, gender, age, avatar });
  if (image) console.log('Image uploaded:', image.filename);

  // Validate username
  if (!validateUsername(username)) {
    return res.status(400).json({
      message: 'Username must be at least 4 characters long and contain at least one number',
    });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already in use, please choose another one' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Determine avatar value: uploaded image filename or predefined avatar index
    const finalAvatar = image ? image.filename : avatar;

    if (!finalAvatar) {
      return res.status(400).json({ message: 'Please select an avatar or upload an image' });
    }

    const user = new User({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      gender,
      age,
      avatar: finalAvatar.toString(),
    });
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, userId: user._id });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    jwt.verify(token, JWT_SECRET);
    const users = await User.find({}, 'username _id firstName lastName gender age avatar');
    res.json(users);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

router.get('/chat-list', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // Find all messages where the current user is either sender or recipient
    const messages = await Message.find({
      $or: [{ senderId: userId }, { recipientId: userId }]
    });

    // Extract unique user IDs from these messages
    const chatUserIds = new Set();
    messages.forEach(msg => {
      if (msg.senderId.toString() !== userId) chatUserIds.add(msg.senderId.toString());
      if (msg.recipientId.toString() !== userId) chatUserIds.add(msg.recipientId.toString());
    });

    // Fetch user details for these IDs
    const chatUsers = await User.find(
      { _id: { $in: Array.from(chatUserIds) } },
      'username _id firstName lastName gender age avatar'
    );

    // Calculate unread counts for each user
    const chatUsersWithUnread = await Promise.all(chatUsers.map(async (user) => {
        const unreadCount = await Message.countDocuments({
            senderId: user._id,
            recipientId: userId,
            isRead: false
        });
        return {
            ...user.toObject(),
            unreadCount
        };
    }));

    res.json(chatUsersWithUnread);
  } catch (error) {
    console.error('Error fetching chat list:', error);
    res.status(401).json({ message: 'Invalid token or server error' });
  }
});

module.exports = router;