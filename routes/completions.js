const express       = require('express');
const router        = express.Router();
const auth          = require('../middleware/auth');
const DayCompletion = require('../models/DayCompletion');

// Serialize a DayCompletion doc → { taskId: bool, ..., _dayDone: bool }
function serialize(doc) {
  const out = {};
  if (doc.taskCompletions) {
    doc.taskCompletions.forEach((val, key) => { out[key] = val; });
  }
  out._dayDone = doc.dayDone;
  return out;
}

// GET /api/completions – returns { 'YYYY-MM-DD': { taskId: bool, _dayDone: bool }, ... }
router.get('/', auth, async (req, res) => {
  try {
    const docs   = await DayCompletion.find({ userId: req.userId });
    const result = {};
    docs.forEach(doc => { result[doc.date] = serialize(doc); });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/completions/toggle – toggle a single task completion for a day
// Body: { date, taskId, value, dayDone }
router.post('/toggle', auth, async (req, res) => {
  try {
    const { date, taskId, value, dayDone } = req.body;

    let doc = await DayCompletion.findOne({ userId: req.userId, date });
    if (!doc) {
      doc = new DayCompletion({ userId: req.userId, date, taskCompletions: {}, dayDone: false });
    }

    if (taskId !== undefined) doc.taskCompletions.set(taskId, value);
    if (dayDone  !== undefined) doc.dayDone = dayDone;

    // Mongoose doesn't always detect Map mutations – mark modified
    doc.markModified('taskCompletions');
    await doc.save();

    res.json({ [date]: serialize(doc) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/completions/reset – delete ALL tasks and completions for the user
router.post('/reset', auth, async (req, res) => {
  try {
    const Task = require('../models/Task');
    await Task.deleteMany({ userId: req.userId });
    await DayCompletion.deleteMany({ userId: req.userId });
    res.json({ success: true, message: 'All data has been reset.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
