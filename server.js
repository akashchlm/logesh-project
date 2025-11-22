const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const pool = require('./config/db');
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

const ensureMasterAdmin = async () => {
  const {
    MASTER_ADMIN_EMAIL,
    MASTER_ADMIN_PASSWORD,
    MASTER_ADMIN_NAME,
    MASTER_ADMIN_USERNAME,
    MASTER_ADMIN_PHONE
  } = process.env;

  if (!MASTER_ADMIN_EMAIL || !MASTER_ADMIN_PASSWORD) {
    console.warn('Master admin credentials are not set. Skipping auto-seed.');
    return;
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [
      MASTER_ADMIN_EMAIL
    ]);

    if (existing.length === 0) {
      const hashed = await bcrypt.hash(MASTER_ADMIN_PASSWORD, 10);
      await pool.query(
        'INSERT INTO users (full_name, username, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
        [
          MASTER_ADMIN_NAME || 'Master Admin',
          MASTER_ADMIN_USERNAME || 'masteradmin',
          MASTER_ADMIN_EMAIL,
          MASTER_ADMIN_PHONE || '+910000000000',
          hashed,
          'admin'
        ]
      );
      console.log('Master admin account seeded');
    }
  } catch (error) {
    console.error('Unable to ensure master admin user', error);
  }
};

ensureMasterAdmin();

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/admin', adminRoutes);

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  if (req.path.startsWith('/admin')) {
    return res.sendFile(path.join(__dirname, 'admin.html'));
  }
  return res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

