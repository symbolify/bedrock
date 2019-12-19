const mongoose = require('mongoose');

const TimeTracker = new mongoose.Schema({
  user: {type: String, required: true, trim: true, unique: true},
  date: {type: String, require: true},
  presence: {
    entry: {type: String, require: true},
    exit: {type: String, default: ""}
  },
  recent: {
    start: {type: String, default: ""}
  },
  breaks: [
    {
      start: {type: String, default: ""},
      end: {type: String, default: ""}
    }
  ],
  updatedAt: {type: String, require: true, default: ""}
});

module.exports = mongoose.model('TimeTracker', TimeTracker);
