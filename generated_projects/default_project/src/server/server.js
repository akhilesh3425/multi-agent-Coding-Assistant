const express = require('express');
const { connectDB } = require('../db');
const taskRoutes = require('./taskRoutes');

const PORT = process.env.PORT || 3000;

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/tasks', taskRoutes);

// Connect to DB
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
