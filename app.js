const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./env');
const apiRoutes = require('./routesIndex');
const requestLogger = require('./requestLogger');
const { notFound, errorHandler } = require('./errorHandler');

function createApp() {
  const app = express();
  const projectRoot = __dirname;

  app.use(cors({ origin: config.corsOrigin === '*' ? true : config.corsOrigin }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  // Security Middleware to block downloading sensitive files from root
  app.use((req, res, next) => {
    const filePath = req.path.toLowerCase();
    
    // Allowed client-facing JS files
    const allowedClientJs = [
      '/script.js',
      '/checkout.js',
      '/product.js',
      '/admin-login.js',
      '/admin-dashboard.js',
      '/api.js',
      '/api-config.js',
      '/socket-client.js'
    ];

    if (filePath.endsWith('.js') && !allowedClientJs.includes(filePath)) {
      return res.status(403).json({ success: false, message: 'Access Denied.' });
    }

    const blockedExtensions = ['.env', '.db', '.db-shm', '.db-wal', '.sql', '.json', '.yml', '.yaml', '.log'];
    const isBlocked = blockedExtensions.some(ext => filePath.endsWith(ext));
    if (isBlocked) {
      return res.status(403).json({ success: false, message: 'Access Denied.' });
    }

    next();
  });

  app.use('/api', apiRoutes);
  app.use(express.static(projectRoot));

  app.get('/', (_req, res) => {
    res.sendFile(path.join(projectRoot, 'index.html'));
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
