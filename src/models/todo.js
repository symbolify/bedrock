const mongoose = require('mongoose');
const shortid = require('shortid');

const Todo = mongoose.Schema({
  shorturl: {type: String, required: true, unique: true, trim: true},
  user: {type: String, required: true, trim: true},
  title: {type: String, required: true, trim: true},
  fav: {type: Boolean, required: true, default: false},
  items: [{
    item: {type: String, required: true, trim: true},
    status: {type: String, required: true, trim: true, default: 'a'}
  }]
});
module.exports = mongoose.model('Todo', Todo);
