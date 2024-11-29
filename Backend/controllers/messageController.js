const Message = require('../models/Message');

// Get Messages Between Two Users
exports.getMessages = async (req, res) => {
  try {
    const { sender, recipient } = req.query;
    const messages = await Message.find({
      $or: [
        { sender, recipient },
        { sender: recipient, recipient: sender },
      ],
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send Message
exports.sendMessage = async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
