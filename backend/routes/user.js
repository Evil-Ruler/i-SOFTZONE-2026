const express = require('express');
const router = express.Router();
const { verifyToken, authorize } = require('../middleware/authMiddleware');
const db = require('../config/db');


/**
 * @route   GET /api/user/profile
 * @desc    Fetch active user credential parameters for the dashboard workspace
 * @access  Protected (Requires valid JWT token)
 */
router.get('/profile', verifyToken, async (req, res) => {
  try {
    // 1. The user's decoded token payload is made accessible here by your authMiddleware
    // req.user usually contains: { id: "user_id_here", role: "user_role" }
    const userId = req.user.id;

    // 2. Fetch the corresponding profile metrics from your database node
    // NOTE: Replace this database placeholder object below with your actual database query logic
    // Example (Prisma): const user = await prisma.user.findUnique({ where: { id: userId } });
    // Example (Mongoose): const user = await User.findById(userId);
    const result = await db.query(
      'SELECT name, email, last_login FROM users WHERE id = $1', 
      [userId]
    );

    // Check if the user actually exists in the PostgreSQL table
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Workforce data profile node not found." });
    }

    // Grab the first matched user row object from the array
    const dbUser = result.rows[0]; 

    // Dynamically build the user object using live database columns
    const user = {
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role || "Senior Project Manager", // Uses DB role, or falls back to default
      // Converts PostgreSQL timestamp to a readable local string format
      lastLogin: dbUser.last_login ? new Date(dbUser.last_login).toLocaleString() : new Date().toLocaleString()
    };

    // 3. Fallback validation check
    if (!user) {
      return res.status(404).json({ message: "Workforce data profile node not found." });
    }

    // 4. Return the requested data values back to your Axios dashboard request payload
    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin
    });

  } catch (error) {
    console.error("Error executing profile directory compilation:", error);
    res.status(500).json({ message: "Internal server error reading workforce node profile." });
  }
});
// Ensure both verifyToken AND authorize('admin') are chained sequentially
router.get('/admin-dashboard', verifyToken, authorize('admin'), (req, res) => {
  res.json({ message: "Welcome to the secure administrator terminal view." });
});

module.exports = router;