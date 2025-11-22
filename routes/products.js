const express = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description, category, price, image_url, stock FROM products ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to fetch products' });
  }
});

router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  const { name, description, price, category, imageUrl, stock } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Name and price are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products (name, description, price, category, image_url, stock)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        name,
        description || '',
        price,
        category || 'General',
        imageUrl || '',
        stock || 0
      ]
    );

    res.status(201).json({ id: result.rows[0].id, message: 'Product created' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to create product' });
  }
});

router.put('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, imageUrl, stock } = req.body;

  try {
    await pool.query(
      `UPDATE products 
       SET name = $1, description = $2, price = $3, category = $4, image_url = $5, stock = $6 
       WHERE id = $7`,
      [name, description, price, category, imageUrl, stock, id]
    );

    res.json({ message: 'Product updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to update product' });
  }
});

router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to delete product' });
  }
});

module.exports = router;
