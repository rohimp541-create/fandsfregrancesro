const { initDatabase, query, getDbType } = require('./database');

(async () => {
  try {
    await initDatabase();
    console.log('DB Type:', getDbType());
    const tables = await query("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('Tables:', tables.map(t => t.name).join(', '));
    const counts = {
      products: (await query('SELECT COUNT(*) as c FROM products'))[0].c,
      orders: (await query('SELECT COUNT(*) as c FROM orders'))[0].c,
      order_items: (await query('SELECT COUNT(*) as c FROM order_items'))[0].c,
      customers: (await query('SELECT COUNT(*) as c FROM customers'))[0].c,
      admins: (await query('SELECT COUNT(*) as c FROM admins'))[0].c,
    };
    console.log('Counts:', JSON.stringify(counts));
  } catch (e) {
    console.log('ERR:', e.message);
  }
  process.exit(0);
})();
