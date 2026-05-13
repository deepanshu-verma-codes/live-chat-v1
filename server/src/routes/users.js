const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const sharp = require('sharp');
const User = require('../models/User');
const Message = require('../models/Message');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Multer configuration: Use memory storage for processing before saving
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const UPLOADS_DIR = path.join(__dirname, '../uploads');
fs.ensureDirSync(UPLOADS_DIR);

// Helper for file processing
const processFile = async (file, isAvatar = false) => {
    const isImage = file.mimetype.startsWith('image/');
    const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    const outputPath = path.join(UPLOADS_DIR, fileName);

    if (isImage) {
        // Compress image using sharp
        await sharp(file.buffer)
            .resize(isAvatar ? { width: 500, height: 500, fit: 'cover' } : { width: 1200, withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toFile(outputPath);
    } else {
        // Just save documents as is
        await fs.writeFile(outputPath, file.buffer);
    }
    
    return fileName;
};

// Username validation function
const validateUsername = (username) => {
  const minLength = 4;
  const hasNumber = /\d/.test(username);
  return username && username.length >= minLength && hasNumber;
};

router.get('/check-username', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ message: 'Username is required' });

  try {
    const user = await User.findOne({ username: username.toLowerCase() });
    res.json({ available: !user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/signup', upload.single('image'), async (req, res) => {
  const { username, password, firstName, lastName, gender, age, avatar } = req.body;
  const image = req.file;

  if (!validateUsername(username)) {
    return res.status(400).json({
      message: 'Username must be at least 4 characters long and contain at least one number',
    });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    let finalAvatar = avatar;
    if (image) {
        finalAvatar = await processFile(image, true);
    }

    if (!finalAvatar) {
      return res.status(400).json({ message: 'Please select an avatar' });
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

router.post('/upload-chat-file', upload.single('file'), async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        jwt.verify(token, JWT_SECRET);
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const fileName = await processFile(req.file);
        const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'document';

        res.json({
            fileUrl: fileName,
            fileType,
            fileName: req.file.originalname
        });
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ message: 'Upload failed' });
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