const express = require('express');
const router = express.Router();
const { searchFlights } = require('../services/serpapi');

router.get('/search', async (req, res) => {
  const { origin, destination, outbound_date, return_date, travel_class } = req.query;

  if (!origin || !destination || !outbound_date) {
    return res.status(400).json({ error: 'origin, destination, and outbound_date are required' });
  }

  try {
    const results = await searchFlights({ origin, destination, outbound_date, return_date, travel_class });
    res.json(results);
  } catch (err) {
    console.error('Flight search error:', err.message);
    res.status(502).json({ error: err.message });
  }
});

module.exports = router;
