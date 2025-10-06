const express = require('express');
const { authenticateToken } = require('./auth');
const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');

const router = express.Router();

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('created_by', 'name username')
      .sort({ createdAt: -1 });

    // Add member count for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const memberCount = await ProjectMember.countDocuments({ project_id: project._id });
        return {
          ...project.toObject(),
          member_count: memberCount + 1 // +1 for creator
        };
      })
    );

    res.json({ projects: projectsWithCounts });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create project
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, tech_stack, status } = req.body;

    const project = new Project({
      title,
      description,
      tech_stack,
      status,
      created_by: req.user.userId
    });

    await project.save();

    // Add creator as first member
    const member = new ProjectMember({
      project_id: project._id,
      user_id: req.user.userId,
      role: 'Creator'
    });
    await member.save();

    const populatedProject = await Project.findById(project._id)
      .populate('created_by', 'name username');

    res.status(201).json({
      project: {
        ...populatedProject.toObject(),
        member_count: 1
      }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('created_by', 'name username');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const memberCount = await ProjectMember.countDocuments({ project_id: project._id });

    res.json({
      project: {
        ...project.toObject(),
        member_count: memberCount + 1
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update project
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is the creator
    if (project.created_by.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('created_by', 'name username');

    res.json({ project: updatedProject });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete project
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is the creator
    if (project.created_by.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Project.findByIdAndDelete(req.params.id);
    await ProjectMember.deleteMany({ project_id: req.params.id });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
