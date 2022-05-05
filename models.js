const mongoose = require("mongoose");

const IssueSchema = new mongoose.Schema({
  issue_title: String,
  issue_text: String,
  created_by: String,
  assigned_to: String,
  status_text: String,
  project: String,
  created_on: {type: Date, default: Date.now},
  updated_on: {type: Date, default: Date.now},
  open: {type: Boolean, default: true},
});

const Issue = mongoose.model("Issue", IssueSchema);

module.exports = Issue;