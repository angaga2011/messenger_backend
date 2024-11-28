const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

// Route: User Registration
router.post('/register', register);

// Route: User Login
router.post('/login', login);

module.exports = router;
