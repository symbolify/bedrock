const mongoose = require("mongoose");

const Event = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true, unique: true },
  createBy: { type: String, required: true, trim: true },
  updatedAt: { type: String, require: true, default: "" }
});

module.export = mongoose.model("Event", Event);
