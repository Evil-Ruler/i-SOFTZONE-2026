const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const employeeRoutes = require('./routes/employee');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
// REGISTER THE USER ROUTE MIXIN
app.use('/api/user', userRoutes); // This prepends "/api/user" to your "/profile" endpoint

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Register the path endpoint prefix
app.use('/api/employees', employeeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
