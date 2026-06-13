const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

// 1. Configure where to save files and how to name them unique
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Saves files directly to your backend/uploads folder
  },
  filename: (req, file, cb) => {
    // Generates a unique name: timestamp + original extension name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 2. Set file filter and strict array constraints (Max 5 Images)
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Blocks files larger than 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error('Format rejected. Only JPEG, JPG, PNG, and PDF files are allowed.'));
    }
  }
}).array('images', 5); // Field name expected from frontend is 'images', maximum 5 files

/**
 * @route   POST /api/employees/upload
 * @desc    Simulate multipart form image uploading to server local storage disk nodes
 * @access  Protected
 */
router.post('/upload', verifyToken, (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Handles native Multer constraint violations (like uploading more than 5 files)
      return res.status(400).json({ error: `Multer configuration error: ${err.message}` });
    } else if (err) {
      // Handles our custom file type validation rejection errors
      return res.status(400).json({ error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Please choose at least one document or profile image node to upload.' });
    }

    // Map over the generated disk files array to create accessible url paths
    const fileUrls = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);

    res.json({
      message: 'Multipart files uploaded to server directory successfully.',
      urls: fileUrls // Returns an array of paths that React will submit to Phase 3 database routes
    });
  });
});

/**
 * @route   GET /api/employees/departments
 * @desc    Fetch all available company departments for dropdown selectors
 * @access  Protected
 */
router.get('/departments', verifyToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM departments ORDER BY department_name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching department configurations.' });
  }
});

/**
 * @route   GET /api/employees/skills
 * @desc    Fetch all master skill tags for checkboxes/multi-selects
 * @access  Protected
 */
router.get('/skills', verifyToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM skills ORDER BY skill_name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching skills directory matrix.' });
  }
});

/**
 * @route   POST /api/employees/create
 * @desc    Assemble complete relational corporate profile map across multi-tables
 * @access  Protected
 */
router.post('/create', verifyToken, async (req, res) => {
  const { department_id, phone, address, designation, salary, imageUrls, skillIds } = req.body;
  const userId = req.user.id; // Extracted from the validated login token

  try {
    // 1. Check if an employee file already exists for this logged-in account
    const profileExist = await db.query('SELECT id FROM employee_profiles WHERE user_id = $1', [userId]);
    if (profileExist.rows.length > 0) {
      return res.status(400).json({ error: 'An employee profile node already exists for this system user.' });
    }

    // 2. Insert master parameters into employee_profiles table
    const profileResult = await db.query(
      `INSERT INTO employee_profiles (user_id, department_id, phone, address, designation, salary) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [userId, department_id, phone, address, designation, salary]
    );
    const newEmployeeId = profileResult.rows[0].id;

    // 3. RELATIONAL MAP: Insert multiple image URL paths (One-to-Many Join)
    if (imageUrls && Array.isArray(imageUrls)) {
      for (let url of imageUrls) {
        await db.query(
          'INSERT INTO employee_images (employee_id, image_url) VALUES ($1, $2)',
          [newEmployeeId, url]
        );
      }
    }

    // 4. RELATIONAL MAP: Insert user capabilities mapping array (Many-to-Many Junction table)
    if (skillIds && Array.isArray(skillIds)) {
      for (let skillId of skillIds) {
        await db.query(
          'INSERT INTO employee_skills (employee_id, skill_id) VALUES ($1, $2)',
          [newEmployeeId, skillId]
        );
      }
    }

    res.status(201).json({ 
      message: 'Relational workforce profile architecture constructed successfully!',
      employeeId: newEmployeeId 
    });

  } catch (err) {
    console.error('Relational profile compilation breakdown:', err);
    res.status(500).json({ error: 'Server error executing profile creation operations.' });
  }
});


/**
 * @route   GET /api/employees/list
 * @desc    Execute multi-table INNER JOIN configurations to return full employee database profiles
 * @access  Protected
 */
router.get('/list', verifyToken, async (req, res) => {
  try {
    // Phase 3 Assignment JOIN 1: Combines Profiles, Users, and Department tables together instantly
    const queryText = `
      SELECT 
        ep.id AS profile_id,
        u.name AS employee_name,
        u.email AS employee_email,
        d.department_name,
        ep.designation,
        ep.phone,
        ep.salary,
        ep.created_at
      FROM employee_profiles ep
      INNER JOIN users u ON ep.user_id = u.id
      LEFT JOIN departments d ON ep.department_id = d.id
      ORDER BY ep.created_at DESC;
    `;

    const result = await db.query(queryText);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error compiling unified workforce profiles registry.' });
  }
});

/**
 * @route   GET /api/employees/dashboard/stats
 * @desc    Execute counting aggregations to collect live metrics for dashboard cards
 * @access  Protected
 */
router.get('/dashboard/stats', verifyToken, async (req, res) => {
  try {
    // 1. Fetch total employees count
    const empResult = await db.query('SELECT COUNT(*) FROM employee_profiles');
    
    // 2. Fetch total departments count
    const deptResult = await db.query('SELECT COUNT(*) FROM departments');
    
    // 3. Fetch total skills count
    const skillResult = await db.query('SELECT COUNT(*) FROM skills');
    
    // 4. Fetch total uploaded images count
    const imgResult = await db.query('SELECT COUNT(*) FROM employee_images');

    // Return the aggregated counts to your frontend dashboard
    res.json({
      totalEmployees: parseInt(empResult.rows[0].count, 10),
      totalDepartments: parseInt(deptResult.rows[0].count, 10),
      totalSkills: parseInt(skillResult.rows[0].count, 10),
      totalImages: parseInt(imgResult.rows[0].count, 10)
    });

  } catch (err) {
    console.error('Error compiling dashboard analytics summary:', err);
    res.status(500).json({ error: 'Server error generating dashboard statistics metrics.' });
  }
});


module.exports = router;