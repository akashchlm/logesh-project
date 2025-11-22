# Pooja Prasadam Storefront

A full-stack sample for selling pooja products with distinct customer and admin experiences. The frontend is plain HTML/CSS/JS while the backend is Node.js + Express with MySQL for persistence.

## Features
- Responsive marketing homepage with searchable product catalog
- Customer registration/login with CAPTCHA, cart mock, enquiry submission
- Master admin dashboard to manage catalog, customers, enquiries, and deliveries
- REST API with JWT auth, bcrypt password hashing, and rate limiting
- MySQL schema covering users, products, enquiries, deliveries, carts, and cart items

## Getting Started
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment**
   - Copy `.env.example` → `.env`
   - Update DB credentials, JWT secret, and master admin defaults
3. **Provision database**
   ```sql
   SOURCE database/schema.sql;
   SOURCE database/seed.sql;
   ```
4. **Run the API**
   ```bash
   npm run dev
   ```
5. **Open the site**
   - Customer portal: `http://localhost:4000/`
   - Admin console: `http://localhost:4000/admin.html`

## Key Scripts
- `npm start` – run Express server
- `npm run dev` – run with Nodemon for auto-reload

## API Overview
- `POST /api/auth/register` – create customer
- `POST /api/auth/login` – login (customer/admin)
- `GET /api/products` – public catalog
- `POST /api/enquiries` – submit enquiry (auth required)
- `GET /api/enquiries` – list enquiries (admin)
- `POST /api/products` – create product (admin)
- `PUT/DELETE /api/products/:id` – manage products (admin)
- `GET/POST/PATCH /api/deliveries` – delivery tracking (admin)
- `GET /api/admin/customers` – manage customers (admin)

## Master Admin Auto-Seed
On server boot, `server.js` checks for the admin defined by `MASTER_ADMIN_EMAIL`. If it does not exist, it creates one using the provided password and metadata.

## Security Notes
- JWT tokens expire after 4 hours
- Rate limiting guards API abuse
- CAPTCHA protects registration against bots
- Use HTTPS and environment-specific secrets in production

## Folder Structure
- `index.html`, `admin.html`, `styles.css` – frontend assets
- `app.js`, `admin.js` – client-side logic
- `server.js` – Express entry point
- `routes/`, `middleware/`, `utils/` – backend modules
- `database/` – schema and sample data

## Next Steps
- Integrate actual payment/checkout flow
- Persist cart items per user
- Add email/SMS notifications for enquiries & deliveries


