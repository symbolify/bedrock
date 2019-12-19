const mongoose = require('mongoose');

const Preference = new mongoose.Schema({
  timezone: {type: String, require: true, default: 'Asia/Kolkata'},
  timeTracker: {
    weekMinTime: {type: Number, default: 40},
    dayMinTime: {type: Number, default: 6},
    halfDayMinTime: {type: Number, default: 5}
  },
  updatedAt: {type: String, require: true, default: Date.now()}
});

module.exports = mongoose.model('Preference', Preference);