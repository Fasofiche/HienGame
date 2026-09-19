require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const packRoutes = require('./routes/packRoutes');
const packAdminRoutes = require('./routes/packAdminRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const paymentWebhookRoutes = require('./routes/paymentWebhookRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const siteSettingsRoutes = require('./routes/siteSettingsRoutes');

const app = express();

app.use(cors());
app.use(express.json({
  verify: (req, res, buf) => {
    if (req.originalUrl === '/api/payments/webhook') req.rawBody = buf;
  }
}));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'HienGame API opérationnelle',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/packs', packRoutes);
app.use('/api/admin/packs', packAdminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payments/webhook', paymentWebhookRoutes);
app.use('/api/admin/inventory', inventoryRoutes);
app.use('/api/settings', siteSettingsRoutes);

app.use(express.static(path.join(__dirname, "../public")));
app.use((req, res, next) => { if (req.method === "GET" && !req.path.startsWith("/api/")) return res.sendFile(path.join(__dirname, "../public/index.html")); next(); });
const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`HienGame API démarrée sur le port ${PORT}`);
});
