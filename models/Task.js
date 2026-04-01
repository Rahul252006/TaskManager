const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  taskId:  { type: String, required: true },   // client-generated UID
  name:    { type: String, required: true, trim: true },
  scope:   { type: String, enum: ['day', 'week', 'always'], default: 'week' },
  repeat:  { type: String, enum: ['none', 'weekly', 'daily'], default: 'none' },
  tag:     { type: String, default: '' },
  weekKey: { type: String, default: '' },       // 'YYYY-MM-DD' of Monday
  dayIdx:  { type: Number, default: -1 },       // 0=Mon … 6=Sun, -1=all days
  created: { type: Number, default: () => Date.now() },
});

taskSchema.index({ userId: 1, taskId: 1 }, { unique: true });

module.exports = mongoose.model('Task', taskSchema);
