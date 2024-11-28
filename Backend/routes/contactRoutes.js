const express = require('express');
const { getContacts, addContact, removeContact } = require('../controllers/contactController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware: Protect routes
router.use(authenticate);

// Route: Get all contacts
router.get('/', getContacts);

// Route: Add a new contact
router.post('/', addContact);

// Route: Remove a contact
router.delete('/', removeContact);

module.exports = router;
