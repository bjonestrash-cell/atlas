const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db/schema');

router.get('/', (req, res) => {
  const { month, type } = req.query;
  let sql = 'SELECT * FROM budget_entries';
  const conditions = [];
  const params = [];

  if (month) {
    conditions.push('month = ?');
    params.push(month);
  }
  if (type) {
    conditions.push('type = ?');
    params.push(type);
  }
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY month ASC, category ASC';

  res.json(all(sql, params));
});

router.post('/', (req, res) => {
  const { month, category, amount, type, notes } = req.body;
  const result = run(
    `INSERT INTO budget_entries (month, category, amount, type, notes) VALUES (?, ?, ?, ?, ?)`,
    [month, category, amount, type || 'actual', notes || '']
  );
  const entry = get('SELECT * FROM budget_entries WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(entry);
});

router.put('/:id', (req, res) => {
  const existing = get('SELECT * FROM budget_entries WHERE id = ?', [Number(req.params.id)]);
  if (!existing) return res.status(404).json({ error: 'Entry not found' });

  const { month, category, amount, type, notes } = req.body;
  run('UPDATE budget_entries SET month=?, category=?, amount=?, type=?, notes=? WHERE id=?', [
    month ?? existing.month,
    category ?? existing.category,
    amount ?? existing.amount,
    type ?? existing.type,
    notes ?? existing.notes,
    Number(req.params.id),
  ]);
  const updated = get('SELECT * FROM budget_entries WHERE id = ?', [Number(req.params.id)]);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const result = run('DELETE FROM budget_entries WHERE id = ?', [Number(req.params.id)]);
  if (result.changes === 0) return res.status(404).json({ error: 'Entry not found' });
  res.json({ success: true });
});

// Summary endpoint
router.get('/summary', (req, res) => {
  const year = req.query.year || new Date().getFullYear().toString();

  const monthly = all(
    `SELECT month, type, SUM(amount) as total FROM budget_entries WHERE month LIKE ? GROUP BY month, type ORDER BY month ASC`,
    [year + '%']
  );

  const byCategory = all(
    `SELECT category, type, SUM(amount) as total FROM budget_entries WHERE month LIKE ? GROUP BY category, type`,
    [year + '%']
  );

  res.json({ monthly, byCategory });
});

module.exports = router;
