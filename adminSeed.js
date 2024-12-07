const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("./models/Admin"); // Path to your Admin model

// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/University_management", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB for seeding"))
  .catch((err) => console.error("MongoDB connection error:", err));

const seedAdmin = async () => {
  const hashedPassword = await bcrypt.hash("admin123", 10); // Replace with your desired password
  const admin = new Admin({
    firstName: "Admin", // Replace with desired first name
    lastName: "User", // Replace with desired last name
    email: "admin@gmail.com", // Replace with your desired email
    password: hashedPassword,
  });

  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: admin.email });
    if (existingAdmin) {
      console.log("Admin user already exists. Skipping seeding.");
    } else {
      await admin.save();
      console.log("Admin user seeded successfully.");
    }
    mongoose.disconnect(); // Disconnect after the operation
  } catch (err) {
    console.error("Error seeding admin user:", err);
    mongoose.disconnect(); // Disconnect on error
  }
};

// Execute the seeding function
seedAdmin();
