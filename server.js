const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const pool = require('./config/db'); // PostgreSQL pool
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const enquiryRoutes = require('./routes/enquiries');
const deliveryRoutes = require('./routes/deliveries');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(
  cors({
    origin: '*'
  })
);

app.use(helmet());
app.use(express.json());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200
  })
);

// Ensure Master Admin (PostgreSQL version)
const ensureMasterAdmin = async () => {
  const {
    MASTER_ADMIN_EMAIL,
    MASTER_ADMIN_PASSWORD,
    MASTER_ADMIN_NAME,
    MASTER_ADMIN_USERNAME,
    MASTER_ADMIN_PHONE
  } = process.env;

  if (!MASTER_ADMIN_EMAIL || !MASTER_ADMIN_PASSWORD) {
    console.warn('Master admin credentials missing. Skipping auto-seed.');
    return;
  }

  try {
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 LIMIT 1',
      [MASTER_ADMIN_EMAIL]
    );

    if (existing.rows.length === 0) {
      const hashed = await bcrypt.hash(MASTER_ADMIN_PASSWORD, 10);

      await pool.query(
        `INSERT INTO users (full_name, username, email, phone, password_hash, role)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          MASTER_ADMIN_NAME || 'Master Admin',
          MASTER_ADMIN_USERNAME || 'masteradmin',
          MASTER_ADMIN_EMAIL,
          MASTER_ADMIN_PHONE || '+910000000000',
          hashed,
          'admin'
        ]
      );

      console.log('Master admin account created');
    }
  } catch (error) {
    console.error('Error while creating master admin:', error);
  }
};

ensureMasterAdmin();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/admin', adminRoutes);

// Static Files
app.use(express.static(__dirname));

app.get('*', (req, res) => {
  if (req.path.startsWith('/admin')) {
    return res.sendFile(path.join(__dirname, 'admin.html'));
  }
  return res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
