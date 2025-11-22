const express = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  const { productId, message, preferredContact } = req.body;
  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    await pool.query(
      'INSERT INTO enquiries (user_id, product_id, message, preferred_contact) VALUES (?, ?, ?, ?)',
      [req.user.id, productId || null, message, preferredContact || 'phone']
    );
    res.status(201).json({ message: 'Enquiry submitted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to submit enquiry' });
  }
});

router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.id, e.message, e.status, e.preferred_contact, e.created_at,
              u.full_name AS customer_name, u.phone, u.email,
              p.name AS product_name
         FROM enquiries e
         LEFT JOIN users u ON u.id = e.user_id
         LEFT JOIN products p ON p.id = e.product_id
        ORDER BY e.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to fetch enquiries' });
  }
});

router.patch('/:id/status', authMiddleware, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE enquiries SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Enquiry status updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to update status' });
  }
});

module.exports = router;

