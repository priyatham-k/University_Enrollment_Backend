const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function () {
      return this.isNew; // Required only when creating a new document
    },
  },
  phone: { type: String, required: true },
  department: { type: String, required: true },
});

module.exports = mongoose.model("Student", studentSchema);
