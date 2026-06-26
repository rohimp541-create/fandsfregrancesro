const eventBus = require('../events/eventBus');
const logger = require('../utils/logger');

function setupSocket(io) {
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('join:admin', () => {
      socket.join('admin');
      logger.debug(`Socket ${socket.id} joined admin room`);
    });

    socket.on('join:storefront', () => {
      socket.join('storefront');
      logger.debug(`Socket ${socket.id} joined storefront room`);
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  const events = [
    'product:created',
    'product:updated',
    'product:deleted',
    'stock:updated',
    'order:created',
    'order:updated',
    'order:deleted',
  ];

  events.forEach((eventName) => {
    eventBus.on(eventName, (data) => {
      if (eventName.startsWith('order:')) {
        io.to('admin').emit(eventName, data);
      }

      if (eventName.startsWith('product:') || eventName.startsWith('stock:')) {
        io.to('storefront').emit(eventName, data);
        io.to('admin').emit(eventName, data);
      }
    });
  });

  logger.info('Socket.io real-time event listeners initialized');
}

module.exports = setupSocket;
