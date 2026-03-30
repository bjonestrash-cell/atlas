const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db/schema');

router.get('/', (req, res) => {
  const { status, month } = req.query;
  let sql = 'SELECT * FROM trips';
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (month) {
    conditions.push("strftime('%Y-%m', start_date) = ?");
    params.push(month);
  }
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY start_date ASC';

  res.json(all(sql, params));
});

router.get('/:id', (req, res) => {
  const trip = get('SELECT * FROM trips WHERE id = ?', [Number(req.params.id)]);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  res.json(trip);
});

router.post('/', (req, res) => {
  const { destination, origin, start_date, end_date, status, purpose, airline, flight_id, notes } = req.body;
  const result = run(
    `INSERT INTO trips (destination, origin, start_date, end_date, status, purpose, airline, flight_id, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [destination, origin || '', start_date, end_date, status || 'planned', purpose || 'leisure', airline || '', flight_id || '', notes || '']
  );
  const trip = get('SELECT * FROM trips WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(trip);
});

router.put('/:id', (req, res) => {
  const existing = get('SELECT * FROM trips WHERE id = ?', [Number(req.params.id)]);
  if (!existing) return res.status(404).json({ error: 'Trip not found' });

  const { destination, origin, start_date, end_date, status, purpose, airline, flight_id, notes } = req.body;
  run(
    `UPDATE trips SET destination=?, origin=?, start_date=?, end_date=?, status=?, purpose=?, airline=?, flight_id=?, notes=?
     WHERE id=?`,
    [
      destination ?? existing.destination,
      origin ?? existing.origin,
      start_date ?? existing.start_date,
      end_date ?? existing.end_date,
      status ?? existing.status,
      purpose ?? existing.purpose,
      airline ?? existing.airline,
      flight_id ?? existing.flight_id,
      notes ?? existing.notes,
      Number(req.params.id),
    ]
  );
  const trip = get('SELECT * FROM trips WHERE id = ?', [Number(req.params.id)]);
  res.json(trip);
});

router.delete('/:id', (req, res) => {
  const result = run('DELETE FROM trips WHERE id = ?', [Number(req.params.id)]);
  if (result.changes === 0) return res.status(404).json({ error: 'Trip not found' });
  res.json({ success: true });
});

module.exports = router;
