-- Create database
CREATE DATABASE pooja_store;

-- Switch to DB
\c pooja_store;

-- USERS TABLE
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  username VARCHAR(80) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role TEXT CHECK (role IN ('customer', 'admin')) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCTS TABLE
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  category VARCHAR(80),
  price NUMERIC(10,2) NOT NULL,
  image_url VARCHAR(255),
  stock INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ENQUIRIES TABLE
CREATE TABLE enquiries (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  product_id INT REFERENCES products(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  status VARCHAR(40) DEFAULT 'New',
  preferred_contact VARCHAR(40) DEFAULT 'phone',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DELIVERIES TABLE
CREATE TABLE deliveries (
  id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES users(id) ON DELETE SET NULL,
  order_ref VARCHAR(60) NOT NULL,
  status VARCHAR(40) DEFAULT 'Pending',
  expected_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CARTS TABLE
CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CART ITEMS TABLE
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1
);
