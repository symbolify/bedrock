const mongoose = require("mongoose");

const Event = new mongoose.Schema({
  type: { type: String, required: true, trim: true, enum: ['event'] },
  code: { type: String, required: true, trim: true, unique: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  images: {
    main: { type: String, required: true, trim: true },
    more: [
      { type: String, trim: true }
    ]
  },
  organizer: { type: String, required: true, trim: true },
  eventStart: { type: Date, default: "" },
  eventDuration: { type: Date, default: "" },
  createdOn: { type: Date, default: "" },
  updatedOn: { type: Date, require: true, default: "" },
  status: { type: String, enum: ['a','i','p'], required: true, default: 'a' }
});

module.export = mongoose.model("Event", Event);