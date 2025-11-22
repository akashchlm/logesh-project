const express = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware, requireRole('admin'));

router.get('/customers', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, full_name, username, email, phone, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to fetch customers' });
  }
});

router.delete('/customers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = ? AND role != "admin"', [id]);
    res.json({ message: 'Customer removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to remove customer' });
  }
});

module.exports = router;

