const fetch = global.fetch || require('node-fetch');

(async () => {
  try {
    const url = 'http://localhost:3000/api/products';
    const r = await fetch(url);
    const txt = await r.text();
    console.log('STATUS', r.status);
    console.log(txt.slice(0, 2000));
  } catch (e) {
    console.error('ERR', e.message);
    process.exit(1);
  }
})();

