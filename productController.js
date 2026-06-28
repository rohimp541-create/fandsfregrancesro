const Product = require('./Product');
const eventBus = require('./eventBus');
const { asyncHandler } = require('./errorHandler');

const productController = {
  getAll: asyncHandler(async (req, res) => {
    const products = await Product.findAll();
    res.json({ success: true, data: products });
  }),

  getById: asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, data: product });
  }),

  create: asyncHandler(async (req, res) => {
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product name and price are required.',
      });
    }

    const product = await Product.create(req.body);
    eventBus.emitProductCreated(product);
    eventBus.emitStockUpdated(product);

    res.status(201).json({ success: true, data: product });
  }),

  update: asyncHandler(async (req, res) => {
    const existing = await Product.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const product = await Product.update(req.params.id, req.body);
    eventBus.emitProductUpdated(product);
    eventBus.emitStockUpdated(product);

    res.json({ success: true, data: product });
  }),

  delete: asyncHandler(async (req, res) => {
    const product = await Product.delete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    eventBus.emitProductDeleted(product.id);
    res.json({ success: true, message: 'Product deleted.', data: { id: product.id } });
  }),
};

module.exports = productController;
