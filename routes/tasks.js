const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const Task    = require('../models/Task');

// GET /api/tasks – all tasks for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).lean();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks – create a task
router.post('/', auth, async (req, res) => {
  try {
    const { taskId, name, scope, repeat, tag, weekKey, dayIdx, created } = req.body;
    const task = await Task.create({ userId: req.userId, taskId, name, scope, repeat, tag, weekKey, dayIdx, created });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tasks/:taskId – update a task
router.put('/:taskId', auth, async (req, res) => {
  try {
    const { name, scope, repeat, tag } = req.body;
    const task = await Task.findOneAndUpdate(
      { userId: req.userId, taskId: req.params.taskId },
      { name, scope, repeat, tag },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:taskId – delete a task
router.delete('/:taskId', auth, async (req, res) => {
  try {
    await Task.findOneAndDelete({ userId: req.userId, taskId: req.params.taskId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
