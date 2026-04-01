const mongoose = require('mongoose');

// One document per user per calendar day
const dayCompletionSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:    { type: String, required: true }, // 'YYYY-MM-DD'
  // Map of taskId → boolean  (key '_dayDone' is stored separately below)
  taskCompletions: { type: Map, of: Boolean, default: {} },
  dayDone: { type: Boolean, default: false },
});

dayCompletionSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DayCompletion', dayCompletionSchema);
