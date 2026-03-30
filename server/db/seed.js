const { initDb, run } = require('./schema');

async function reset() {
  await initDb();

  run('DELETE FROM trips');
  run('DELETE FROM points_balances');
  run('DELETE FROM price_alerts');
  run('DELETE FROM budget_entries');
  run('DELETE FROM points_transactions');

  console.log('Database cleared. All tables are empty.');
  process.exit(0);
}

reset().catch((err) => {
  console.error('Reset failed:', err);
  process.exit(1);
});
