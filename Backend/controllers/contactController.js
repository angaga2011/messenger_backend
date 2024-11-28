const User = require('../models/User');

// Get Contacts
exports.getContacts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add Contact
exports.addContact = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.contacts.push(req.body.contact);
    await user.save();
    res.status(201).json(user.contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove Contact
exports.removeContact = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.contacts = user.contacts.filter((contact) => contact !== req.body.contact);
    await user.save();
    res.status(200).json(user.contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
