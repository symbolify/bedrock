const mongoose = require("mongoose");

const TimeTrackerReport = new mongoose.Schema({
  user: { type: String, required: true, trim: true },
  date: { type: String, require: true },
  presence: {
    entry: { type: String, require: true },
    exit: { type: String, default: "" }
  },
  recent: {
    start: { type: String, default: "" }
  },
  breaks: [
    {
      start: { type: String, default: "" },
      end: { type: String, default: "" }
    }
  ],
  updatedAt: { type: String, require: true, default: "" }
});

module.exports = mongoose.model('TimeTrackerReport', TimeTrackerReport);
