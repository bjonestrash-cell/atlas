require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { initDb, all, run } = require('./db/schema');
const { getLowestPrice } = require('./services/serpapi');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/trips', require('./routes/trips'));
app.use('/api/points', require('./routes/points'));
app.use('/api/flights', require('./routes/flights'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/budget', require('./routes/budget'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Price alert cron job — runs daily at 8am
cron.schedule('0 8 * * *', async () => {
  console.log('[CRON] Checking price alerts...');
  const alerts = all('SELECT * FROM price_alerts WHERE active = 1');

  for (const alert of alerts) {
    const price = await getLowestPrice(alert.origin, alert.destination, alert.date);
    if (price !== null) {
      run("UPDATE price_alerts SET current_price = ?, last_checked = datetime('now') WHERE id = ?", [price, alert.id]);
      if (price <= alert.target_price) {
        console.log(`[ALERT] Price drop! ${alert.origin}->${alert.destination}: $${price} (target: $${alert.target_price})`);
      }
    }
  }
  console.log('[CRON] Price alert check complete.');
});

// Initialize DB then start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Atlas server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
