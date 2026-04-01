const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db/schema');

router.get('/', (req, res) => {
  res.json(all('SELECT * FROM loyalty_status ORDER BY category, program_name'));
});

router.post('/', (req, res) => {
  const { program_name, category, status_level, alliance, expiration_date, notes } = req.body;
  if (!program_name || !category) return res.status(400).json({ error: 'program_name and category required' });

  const existing = get('SELECT * FROM loyalty_status WHERE program_name = ?', [program_name]);
  if (existing) {
    run(
      `UPDATE loyalty_status SET status_level=?, alliance=?, expiration_date=?, notes=?, updated_at=datetime('now') WHERE program_name=?`,
      [status_level || '', alliance || '', expiration_date || '', notes || '', program_name]
    );
  } else {
    run(
      `INSERT INTO loyalty_status (program_name, category, status_level, alliance, expiration_date, notes) VALUES (?, ?, ?, ?, ?, ?)`,
      [program_name, category, status_level || '', alliance || '', expiration_date || '', notes || '']
    );
  }
  const row = get('SELECT * FROM loyalty_status WHERE program_name = ?', [program_name]);
  res.json(row);
});

router.delete('/:id', (req, res) => {
  run('DELETE FROM loyalty_status WHERE id = ?', [Number(req.params.id)]);
  res.json({ success: true });
});

module.exports = router;
