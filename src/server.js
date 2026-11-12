require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./config/db');
const mediaRoutes = require('./routes/mediaRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'telegram-media-middleware' });
});

// Mount media API routes
app.use('/api/v1/media', mediaRoutes);

const PORT = process.env.PORT || 3000;

initializeDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[SERVER] Middleware running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[DB ERROR]', err.message);
    process.exit(1);
  });