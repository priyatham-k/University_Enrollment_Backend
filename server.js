// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/user');
const applicationRoutes = require('./routes/studentApplication')
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from this origin
}));
app.use(bodyParser.json());
app.use('/api/user', authRoutes);
app.use('/api/submitapplication',applicationRoutes)

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/University_management', {
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
