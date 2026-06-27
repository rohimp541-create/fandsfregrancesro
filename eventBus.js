const EventEmitter = require('events');
const logger = require('./logger');

class StoreEventBus extends EventEmitter {
  emitProductCreated(product) {
    logger.info(`Event: product:created - ID ${product.id}`);
    this.emit('product:created', product);
  }

  emitProductUpdated(product) {
    logger.info(`Event: product:updated - ID ${product.id}`);
    this.emit('product:updated', product);
  }

  emitProductDeleted(productId) {
    logger.info(`Event: product:deleted - ID ${productId}`);
    this.emit('product:deleted', { id: productId });
  }

  emitOrderCreated(order) {
    logger.info(`Event: order:created - ID ${order.id}`);
    this.emit('order:created', order);
  }

  emitOrderUpdated(order) {
    logger.info(`Event: order:updated - ID ${order.id}`);
    this.emit('order:updated', order);
  }

  emitOrderDeleted(orderId) {
    logger.info(`Event: order:deleted - ID ${orderId}`);
    this.emit('order:deleted', { id: orderId });
  }

  emitStockUpdated(product) {
    logger.info(`Event: stock:updated - Product ${product.id}, stock ${product.stock_quantity}`);
    this.emit('stock:updated', product);
  }
}

module.exports = new StoreEventBus();
