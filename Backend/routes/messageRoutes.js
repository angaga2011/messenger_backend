const express = require('express');
const { getMessages, sendMessage } = require('../controllers/messageController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware: Protect routes
router.use(authenticate);

// Route: Get messages between two users
router.get('/', getMessages);

// Route: Send a message
router.post('/', sendMessage);

module.exports = router;
