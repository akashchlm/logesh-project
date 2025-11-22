-- Insert Products
INSERT INTO products (name, description, category, price, image_url, stock) VALUES
('Brass Diya Set', 'Traditional brass diya set for daily aarti.', 'Lighting', 14.99, 'assets/images/brass-diya.jpg', 120),
('Sandalwood Incense', 'Hand-rolled incense sticks with pure sandalwood.', 'Fragrance', 5.49, 'assets/images/sandalwood-incense.jpg', 250),
('Pooja Thali Deluxe', 'Complete pooja thali with bell, diya, and kumkum box.', 'Accessories', 34.00, 'assets/images/pooja-thali.jpg', 75),
('Camphor Tablets', 'Smokeless camphor tablets for rituals.', 'Essentials', 7.99, 'assets/images/camphor.jpg', 180),
('Tulsi Mala', 'Handcrafted tulsi mala for chanting.', 'Spiritual', 9.99, 'assets/images/tulsi-mala.jpg', 95);

-- Insert Enquiries
INSERT INTO enquiries (user_id, product_id, message, status, preferred_contact) VALUES
(NULL, 1, 'Need 50 diya sets for upcoming event.', 'New', 'email'),
(NULL, 2, 'Do you offer bulk pricing for incense?', 'In Progress', 'phone');

-- Insert Deliveries
INSERT INTO deliveries (customer_id, order_ref, status, expected_date, notes) VALUES
(NULL, 'ORD-1001', 'Packed', CURRENT_DATE + INTERVAL '5 days', 'Awaiting pickup'),
(NULL, 'ORD-1002', 'Delivered', CURRENT_DATE - INTERVAL '1 day', 'Signed by customer');
