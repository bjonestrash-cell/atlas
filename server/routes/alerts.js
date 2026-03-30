const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db/schema');

router.get('/', (req, res) => {
  res.json(all('SELECT * FROM price_alerts ORDER BY created_at DESC'));
});

router.post('/', (req, res) => {
  const { origin, destination, target_price, date } = req.body;
  const result = run(
    `INSERT INTO price_alerts (origin, destination, target_price, date) VALUES (?, ?, ?, ?)`,
    [origin, destination, target_price, date || null]
  );
  const alert = get('SELECT * FROM price_alerts WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(alert);
});

router.put('/:id', (req, res) => {
  const { target_price, active } = req.body;
  const existing = get('SELECT * FROM price_alerts WHERE id = ?', [Number(req.params.id)]);
  if (!existing) return res.status(404).json({ error: 'Alert not found' });

  run('UPDATE price_alerts SET target_price=?, active=? WHERE id=?', [
    target_price ?? existing.target_price,
    active !== undefined ? (active ? 1 : 0) : existing.active,
    Number(req.params.id),
  ]);
  const updated = get('SELECT * FROM price_alerts WHERE id = ?', [Number(req.params.id)]);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const result = run('DELETE FROM price_alerts WHERE id = ?', [Number(req.params.id)]);
  if (result.changes === 0) return res.status(404).json({ error: 'Alert not found' });
  res.json({ success: true });
});

module.exports = router;
