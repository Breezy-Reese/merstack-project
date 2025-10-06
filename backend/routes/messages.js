const express = require('express');
const { authenticateToken } = require('./auth');
const Message = require('../models/Message');
const User = require('../models/User');

const router = express.Router();

// Get conversations for current user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    // Get unique user IDs from sent and received messages
    const sentMessages = await Message.find({ sender_id: req.user.userId, message_type: 'direct' })
      .distinct('receiver_id');
    const receivedMessages = await Message.find({ receiver_id: req.user.userId, message_type: 'direct' })
      .distinct('sender_id');

    const userIds = [...new Set([...sentMessages, ...receivedMessages])];

    if (userIds.length === 0) {
      return res.json({ conversations: [] });
    }

    const conversations = await User.find({ _id: { $in: userIds } }, '-password');
    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages between two users
router.get('/direct/:userId', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find({
      message_type: 'direct',
      $or: [
        { sender_id: req.user.userId, receiver_id: req.params.userId },
        { sender_id: req.params.userId, receiver_id: req.user.userId }
      ]
    })
    .populate('sender_id', 'name username')
    .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { receiver_id, project_id, content, message_type } = req.body;

    const message = new Message({
      sender_id: req.user.userId,
      receiver_id,
      project_id,
      content,
      message_type
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender_id', 'name username');

    // Emit real-time message to receiver(s)
    const io = req.app.get('io');
    if (io) {
      if (receiver_id) {
        // Direct message
        io.to(`user_${receiver_id}`).emit('new_message', populatedMessage);
      } else if (project_id) {
        // Project group message - emit to all project members
        const ProjectMember = require('../models/ProjectMember');
        const members = await ProjectMember.find({ project_id }).select('user_id');
        members.forEach(member => {
          io.to(`user_${member.user_id}`).emit('new_message', populatedMessage);
        });
      } else if (message_type === 'general') {
        // General message - emit to all connected users
        io.emit('new_message', populatedMessage);
      }
    }

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

const ProjectMember = require('../models/ProjectMember');

// Get project messages
router.get('/project/:projectId', authenticateToken, async (req, res) => {
  try {
    // Check if user is a member of the project
    const isMember = await ProjectMember.exists({
      project_id: req.params.projectId,
      user_id: req.user.userId
    });

    if (!isMember) {
      return res.status(403).json({ error: 'Access denied: Not a project member' });
    }

    const messages = await Message.find({
      project_id: req.params.projectId,
      message_type: 'project_group'
    })
    .populate('sender_id', 'name username')
    .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    console.error('Get project messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get general messages
router.get('/general', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find({
      message_type: 'general'
    })
    .populate('sender_id', 'name username')
    .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    console.error('Get general messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
