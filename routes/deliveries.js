const express = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.id, d.order_ref, d.status, d.expected_date, d.notes, d.created_at,
              u.full_name AS customer_name, u.phone
         FROM deliveries d
         LEFT JOIN users u ON u.id = d.customer_id
        ORDER BY d.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to fetch deliveries' });
  }
});

router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  const { orderRef, status, expectedDate, notes, customerId } = req.body;
  if (!orderRef) {
    return res.status(400).json({ message: 'Order reference is required' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO deliveries (order_ref, status, expected_date, notes, customer_id) VALUES (?, ?, ?, ?, ?)',
      [orderRef, status || 'Pending', expectedDate || null, notes || '', customerId || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Delivery created' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to create delivery' });
  }
});

router.patch('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { status, expectedDate, notes } = req.body;
  try {
    await pool.query(
      'UPDATE deliveries SET status = ?, expected_date = ?, notes = ? WHERE id = ?',
      [status, expectedDate, notes, id]
    );
    res.json({ message: 'Delivery updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to update delivery' });
  }
});

module.exports = router;

