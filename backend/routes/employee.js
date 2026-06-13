const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

// 1. Configure storage engine with precise unique filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
  }
});

// 2. Set strict payload filters and safe extension anchors ($)
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /^\.(jpeg|jpg|png|pdf)$/;
    const allowedMimeTypes = /^image\/(jpeg|jpg|png)$|^application\/pdf$/;

    const extName = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedMimeTypes.test(file.mimetype);

    if (extName && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error('Format rejected. Only JPEG, JPG, PNG, and PDF files are allowed.'));
    }
  }
}).array('images', 5); 

/**
 * @route   POST /api/employees/upload
 * @desc    Simulate multipart form image uploading to server local storage disk nodes
 * @access  Protected
 */
router.post('/upload', verifyToken, (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Multer configuration error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Please choose at least one document or profile image node to upload.' });
    }

    // FIXED: Save relative paths to database instead of hardcoded domain endpoints
    const fileUrls = req.files.map(file => `/uploads/${file.filename}`);

    res.json({
      message: 'Multipart files uploaded to server directory successfully.',
      urls: fileUrls 
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
    // 🛠️ CHANGED: Removed 'ORDER BY department_name ASC' to prevent database column name crashes
    const result = await db.query('SELECT * FROM departments');
    res.json(result.rows);
  } catch (err) {
    // 🛠️ ADDED: Logs the exact SQL database error to your backend terminal window
    console.error("❌ CRITICAL DATABASE ERROR IN GET DEPARTMENTS:", err.message);
    res.status(500).json({ error: `Database Error: ${err.message}` });
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
 * @desc    Assemble complete relational corporate profile map across multi-tables with Transactions
 * @access  Protected
 */
/**
 * @route   POST /api/employees/create
 * @desc    Assemble complete relational corporate profile map across multi-tables
 * @access  Protected
 */
/**
 * @route   POST /api/employees/create
 * @desc    Admin Onboarding: Create a User Account and Employee Profile simultaneously (Transaction Safe)
 * @access  Protected (Admin Only)
 */
/**
 * @route   POST /api/employees/create
 * @desc    Assemble relational profile map for an existing user account
 * @access  Protected (Admin Only)
 */
router.post('/create', verifyToken, async (req, res) => {
  const { user_id, department_id, phone, address, designation, salary, imageUrls, skillIds } = req.body;

  try {
    if (!user_id) {
      return res.status(400).json({ error: 'Please choose a registered user account to bind this profile to.' });
    }

    // 1. Double check constraints to avoid accidental duplication crashes
    const profileExist = await db.query('SELECT id FROM employee_profiles WHERE user_id = $1', [user_id]);
    if (profileExist.rows.length > 0) {
      return res.status(400).json({ error: 'An employee profile already exists for this chosen account.' });
    }

    // 2. Insert master parameters into employee_profiles table linked to the chosen user_id
    const profileResult = await db.query(
      `INSERT INTO employee_profiles (user_id, department_id, phone, address, designation, salary) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [user_id, department_id, phone, address, designation, salary]
    );
    const newEmployeeId = profileResult.rows[0].id;

    // 3. One-to-Many Join: Process physical validation asset url paths
    if (imageUrls && Array.isArray(imageUrls)) {
      for (let url of imageUrls) {
        await db.query('INSERT INTO employee_images (employee_id, image_url) VALUES ($1, $2)', [newEmployeeId, url]);
      }
    }

    // 4. Many-to-Many Join: Write references into capabilities junction table
    if (skillIds && Array.isArray(skillIds)) {
      for (let skillId of skillIds) {
        await db.query('INSERT INTO employee_skills (employee_id, skill_id) VALUES ($1, $2)', [newEmployeeId, skillId]);
      }
    }

    res.status(201).json({ message: 'Relational profile attached cleanly to user ID!', employeeId: newEmployeeId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Relational mapping execution failure: ${err.message}` });
  }
});




/**
 * @route   GET /api/employees/list
 * @desc    Execute multi-table INNER JOIN configurations to return full employee database profiles
 * @access  Protected
 */
router.get('/list', verifyToken, async (req, res) => {
  try {
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
    const empResult = await db.query('SELECT COUNT(*) FROM employee_profiles');
    const deptResult = await db.query('SELECT COUNT(*) FROM departments');
    const skillResult = await db.query('SELECT COUNT(*) FROM skills');
    const imgResult = await db.query('SELECT COUNT(*) FROM employee_images');

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

/**
 * @route   POST /api/employees/departments
 * @desc    Add a brand new corporate department to the database
 * @access  Protected (Admin Only)
 */
router.post('/departments', verifyToken, async (req, res) => {
  try {
    const { department_name } = req.body;
    if (!department_name) return res.status(400).json({ error: 'Department name required' });

    const result = await db.query(
      'INSERT INTO departments (department_name) VALUES ($1) RETURNING *',
      [department_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error saving department node.' });
  }
});

/**
 * @route   POST /api/employees/skills
 * @desc    Add a brand new capability skill tag to the database
 * @access  Protected (Admin Only)
 */
router.post('/skills', verifyToken, async (req, res) => {
  try {
    const { skill_name } = req.body;
    if (!skill_name) return res.status(400).json({ error: 'Skill name required' });

    const result = await db.query(
      'INSERT INTO skills (skill_name) VALUES ($1) RETURNING *',
      [skill_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error saving technical skill tag.' });
  }
});

/**
 * @route   GET /api/employees/unassigned-users
 * @desc    Fetch all registered user accounts that do NOT have a corporate profile yet
 * @access  Protected (Admin Only)
 */
router.get('/unassigned-users', verifyToken, async (req, res) => {
  try {
    // Left Join filter to find users whose IDs do not exist inside employee_profiles
    const queryText = `
      SELECT u.id, u.name, u.email 
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE ep.user_id IS NULL AND u.role = 'user'
      ORDER BY u.name ASC;
    `;
    const result = await db.query(queryText);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching unassigned users:", err.message);
    res.status(500).json({ error: 'Server error reading system accounts.' });
  }
});


/**
 * @route   DELETE /api/employees/:id
 * @desc    Purge an employee profile record from the system (Cascading Safe)
 * @access  Protected (Admin Only)
 */
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Remove references from junction tables first to prevent constraint errors
    await db.query('DELETE FROM employee_skills WHERE employee_id = $1', [id]);
    await db.query('DELETE FROM employee_images WHERE employee_id = $1', [id]);

    // 2. Remove the primary corporate profile record
    const result = await db.query('DELETE FROM employee_profiles WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Target employee profile record not found.' });
    }

    res.json({ message: 'Relational data row purged from local Postgres node successfully.' });
  } catch (err) {
    console.error("❌ PURGE EXECUTION ERROR:", err.message);
    res.status(500).json({ error: `Purge failure: ${err.message}` });
  }
});

/**
 * @route   GET /api/employees/:id
 * @desc    Fetch a single specific employee structure by unique corporate identifier
 * @access  Protected
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Joins profiles with users and departments for a clean detail view
    const selectQuery = `
      SELECT 
        ep.id,
        ep.user_id,
        ep.department_id,
        ep.phone,
        ep.address,
        ep.designation,
        ep.salary,
        u.name AS employee_name,
        u.email AS employee_email
      FROM employee_profiles ep
      INNER JOIN users u ON ep.user_id = u.id
      WHERE ep.id = $1
    `;
    const result = await db.query(selectQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workforce profile row matching parameter not found.' });
    }

    // Return the profile row cell configuration back to your edit form fields
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ ERROR RETRIEVING SINGLE PROFILE ROW:", err.message);
    res.status(500).json({ error: `Fetch failure: ${err.message}` });
  }
});




module.exports = router;
