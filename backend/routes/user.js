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
    const userId = req.user.id;

    // 🛠️ THE FIX: Added 'role' explicitly into your SQL SELECT query
    const result = await db.query(
      'SELECT name, email, role, last_login FROM users WHERE id = $1', 
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
      role: dbUser.role || "user", // Defaults to standard 'user' if null in DB
      lastLogin: dbUser.last_login ? new Date(dbUser.last_login).toLocaleString() : new Date().toLocaleString()
    };

    // Return the requested data values back to your Axios dashboard request payload
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

/**
 * @route   GET /api/user/admin-dashboard
 * @desc    Fetch summary counting aggregates for Phase 3 Admin Dashboard Cards
 * @access  Protected (Admins Only)
 */
router.get('/admin-dashboard', verifyToken, authorize('admin'), async (req, res) => {
  try {
    // Phase 3 Requirement: Use asynchronous multi-table counts to feed your dashboard boxes
    const empCount = await db.query('SELECT COUNT(*) FROM employee_profiles');
    const deptCount = await db.query('SELECT COUNT(*) FROM departments');
    const skillCount = await db.query('SELECT COUNT(*) FROM skills');
    const imgCount = await db.query('SELECT COUNT(*) FROM employee_images');

    res.json({
      message: "Welcome to the secure administrator terminal view.",
      stats: {
        totalEmployees: empCount.rows[0].count,
        totalDepartments: deptCount.rows[0].count,
        totalSkills: skillCount.rows[0].count,
        totalImages: imgCount.rows[0].count
      }
    });
  } catch (error) {
    console.error("Error executing dashboard aggregation:", error);
    res.status(500).json({ message: "Internal server error fetching management metrics." });
  }
});

module.exports = router;
