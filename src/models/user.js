const mongoose = require('mongoose');

const User = mongoose.Schema({
  email: {type: String, required: true, unique: true, trim: true},
  password: {type: String, required: true, trim: true},
  name: {type: String, default: '', trim: true},
  dob: {type: Date, required: true},
  gender: {type: String, enum: ['m','f','o'], required: true},
  newsletter: {type: Boolean, default: true, required: true},
  created: {type: Date, required: true},
  updated: {type: Date, required: true},
  zone: {type: String},
  zoneCode: {type: String},
  status: {type: String, default: 'p'}
});

module.exports = mongoose.model('User', User);
