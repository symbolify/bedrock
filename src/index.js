const mongoose = require("mongoose");
const path = require("path");
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 8080;
const DB =
  process.env.MONGO_DB ||
  "mongodb://127.0.0.1:27017/api?gssapiServiceName=mongodb";

//cors
app.use(cors());

// Body parser for POST method: receive data
app.use(express.json()); //Data posted with JSON format
app.use(express.urlencoded({ extended: false })); //Handel direct form submission

//hitting home api url
app.get("/", (req, res) => {
  res.status(200).json({ code: 200, type: "string", data: "live" });
});

// Static folder
app.use(express.static(path.join(__dirname)));

//Api Router
app.use("/api/user", require("./routes/user"));
app.use("/api/todo", require("./routes/todo"));
app.use("/api/event", require("./routes/event"));
app.use("/api/timetracker", require("./routes/time-tracker"));
app.use("/api/preference", require("./routes/preference"));

app.listen(PORT, (req, res) => {
  console.log("Running on ", PORT);
});
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});
