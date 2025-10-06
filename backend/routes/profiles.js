const express = require('express');
const mongoose = require('mongoose');
const { authenticateToken } = require('./auth');
const User = require('../models/User');
const Project = require('../models/Project');
const Message = require('../models/Message');

const router = express.Router();

// Get all profiles (for developer search)
router.get('/', async (req, res) => {
  try {
    const profiles = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json({ profiles });
  } catch (error) {
    console.error('Get profiles error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get profile by ID
router.get('/:id', async (req, res) => {
  try {
    if (!req.params.id || req.params.id === 'undefined' || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid profile ID' });
    }
    const profile = await User.findById(req.params.id).select('-password');
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user can update this profile
    if (req.user.userId !== req.params.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedProfile = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile: updatedProfile });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get stats for dashboard
router.get('/stats', async (req, res) => {
  try {
    const developerCount = await User.countDocuments();
    const projectCount = await Project.countDocuments();
    const messageCount = await Message.countDocuments();

    const profiles = await User.find({}, 'country languages experience');

    const countryCounts = {};
    const languageCounts = {};
    const experienceCounts = {};

    profiles.forEach(profile => {
      if (profile.country) {
        countryCounts[profile.country] = (countryCounts[profile.country] || 0) + 1;
      }

      profile.languages.forEach(lang => {
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      });

      experienceCounts[profile.experience] = (experienceCounts[profile.experience] || 0) + 1;
    });

    const topCountries = Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topLanguages = Object.entries(languageCounts)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const experienceLevels = Object.entries(experienceCounts)
      .map(([level, count]) => ({ level, count }))
      .sort((a, b) => {
        const order = { 'Beginner': 1, 'Intermediate': 2, 'Expert': 3 };
        return (order[a.level] || 0) - (order[b.level] || 0);
      });

    res.json({
      stats: {
        totalDevelopers: developerCount,
        totalProjects: projectCount,
        totalMessages: messageCount,
        topCountries,
        topLanguages,
        experienceLevels,
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
