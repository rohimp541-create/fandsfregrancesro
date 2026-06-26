const path = require('path');
const db = require('better-sqlite3')(path.join(__dirname, 'data', 'store.db'));
const fs = require('fs');
const out = (msg) => { fs.appendFileSync(path.join(__dirname, 'probe.log'), msg + '\n'); };

out('--- DB probe ---');
out('tables: ' + JSON.stringify(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()));
try {
  const r = db.prepare('SELECT COUNT(*) as c FROM products').get();
  out('products_count: ' + JSON.stringify(r));
  const sample = db.prepare('SELECT id,name,price,stock_quantity,is_active FROM products LIMIT 5').all();
  out('sample: ' + JSON.stringify(sample));
} catch (e) {
  out('err: ' + e.message);
}
out('--- Product model ---');
try {
  const Product = require(path.join(__dirname, 'src', 'models', 'Product'));
  Product.findAll().then(rows => {
    out('model.findAll: ' + JSON.stringify(rows).slice(0, 1500));
  }).catch(e => out('model err: ' + e.message));
} catch (e) {
  out('model require err: ' + e.message);
}
