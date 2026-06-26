const http = require('http');
const { initDatabase, query } = require('./src/config/database');

(async () => {
  await initDatabase();
  // Direct DB check
  const dbProducts = await query('SELECT id, name, price, stock_quantity, image_url FROM products LIMIT 5');
  console.log('DB products sample:', JSON.stringify(dbProducts, null, 2));

  // Start server in-process
  const app = require('./src/app');
  const server = app.listen(3000, async () => {
    console.log('Server started on 3000');
    http.get('http://localhost:3000/api/products', (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        console.log('STATUS:', res.statusCode);
        console.log('BODY (first 1200):', data.substring(0, 1200));
        server.close();
        process.exit(0);
      });
    }).on('error', (e) => {
      console.log('REQ ERR:', e.message);
      server.close();
      process.exit(0);
    });
  });
})();
