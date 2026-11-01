const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 3000;

// Pooled connection, not a single open connection — survives the
// occasional dropped connection without the whole service crashing,
// and handles more than one request at a time.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'productdb',
  waitForConnections: true,
  connectionLimit: 5,
});

// Plain 200, no DB call — this is what the ALB/ECS health check
// hits, and it should reflect "is the process alive," not "is the
// database reachable."
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/products', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, description, price_cents, image_url FROM products ORDER BY id'
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error('Failed to query products:', err.message);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

app.listen(port, () => {
  console.log(`product-service listening on port ${port}`);
});
