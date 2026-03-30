const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db/schema');

router.get('/', (req, res) => {
  res.json(all('SELECT * FROM points_balances ORDER BY program_name ASC'));
});

// Bulk save — upsert all programs at once
router.post('/bulk', (req, res) => {
  const { programs } = req.body;
  if (!Array.isArray(programs)) return res.status(400).json({ error: 'programs array required' });

  for (const p of programs) {
    const existing = get('SELECT id FROM points_balances WHERE program_name = ?', [p.program_name]);
    if (existing) {
      run(
        `UPDATE points_balances SET balance=?, cpp=?, expiration_date=?, updated_at=datetime('now') WHERE program_name=?`,
        [p.balance || 0, p.cpp || 1.0, p.expiration_date || null, p.program_name]
      );
    } else {
      run(
        `INSERT INTO points_balances (program_name, balance, cpp, expiration_date) VALUES (?, ?, ?, ?)`,
        [p.program_name, p.balance || 0, p.cpp || 1.0, p.expiration_date || null]
      );
    }
  }

  res.json(all('SELECT * FROM points_balances ORDER BY program_name ASC'));
});

router.post('/', (req, res) => {
  const { program_name, balance, cpp, expiration_date } = req.body;
  const existing = get('SELECT id FROM points_balances WHERE program_name = ?', [program_name]);
  if (existing) {
    run(`UPDATE points_balances SET balance=?, cpp=?, expiration_date=?, updated_at=datetime('now') WHERE program_name=?`,
      [balance || 0, cpp || 1.0, expiration_date || null, program_name]);
    return res.json(get('SELECT * FROM points_balances WHERE program_name = ?', [program_name]));
  }
  const result = run(`INSERT INTO points_balances (program_name, balance, cpp, expiration_date) VALUES (?, ?, ?, ?)`,
    [program_name, balance || 0, cpp || 1.0, expiration_date || null]);
  res.status(201).json(get('SELECT * FROM points_balances WHERE id = ?', [result.lastInsertRowid]));
});

router.put('/:id', (req, res) => {
  const existing = get('SELECT * FROM points_balances WHERE id = ?', [Number(req.params.id)]);
  if (!existing) return res.status(404).json({ error: 'Program not found' });
  const { program_name, balance, cpp, expiration_date } = req.body;
  run(`UPDATE points_balances SET program_name=?, balance=?, cpp=?, expiration_date=?, updated_at=datetime('now') WHERE id=?`,
    [program_name ?? existing.program_name, balance ?? existing.balance, cpp ?? existing.cpp,
     expiration_date !== undefined ? expiration_date : existing.expiration_date, Number(req.params.id)]);
  res.json(get('SELECT * FROM points_balances WHERE id = ?', [Number(req.params.id)]));
});

router.delete('/:id', (req, res) => {
  const result = run('DELETE FROM points_balances WHERE id = ?', [Number(req.params.id)]);
  if (result.changes === 0) return res.status(404).json({ error: 'Program not found' });
  res.json({ success: true });
});

router.get('/transactions', (req, res) => {
  const { program } = req.query;
  let sql = 'SELECT * FROM points_transactions';
  const params = [];
  if (program) { sql += ' WHERE program_name = ?'; params.push(program); }
  sql += ' ORDER BY date DESC';
  res.json(all(sql, params));
});

router.post('/transactions', (req, res) => {
  const { program_name, amount, transaction_type, description, date } = req.body;
  const result = run(`INSERT INTO points_transactions (program_name, amount, transaction_type, description, date) VALUES (?, ?, ?, ?, ?)`,
    [program_name, amount, transaction_type, description || '', date || new Date().toISOString().split('T')[0]]);
  if (transaction_type === 'earned') run('UPDATE points_balances SET balance = balance + ? WHERE program_name = ?', [amount, program_name]);
  else if (transaction_type === 'redeemed') run('UPDATE points_balances SET balance = balance - ? WHERE program_name = ?', [amount, program_name]);
  res.status(201).json(get('SELECT * FROM points_transactions WHERE id = ?', [result.lastInsertRowid]));
});

module.exports = router;
