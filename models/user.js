// models/user.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["student", "instructor", "admin"],
    required: true,
  },
  enrolledCourses: [{ type: mongoose.Schema.Types.Mixed }],
  payment: [{ courceName: String, payment: String }],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
