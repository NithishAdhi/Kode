 const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  uniqueID: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  skills: { type: [String] },
  experience: { type: String },
  education: { type: String },
  resumeFile: { type: String }, // Store file URL or path
  createdAt: { type: Date, default: Date.now },
});

const Resume = mongoose.model("Resume", resumeSchema);
module.exports = Resume;
