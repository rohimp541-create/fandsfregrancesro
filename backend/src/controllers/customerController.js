const Customer = require('../models/Customer');
const { asyncHandler } = require('../middleware/errorHandler');

const customerController = {
  getAll: asyncHandler(async (req, res) => {
    const customers = await Customer.findAll();
    res.json({ success: true, data: customers });
  }),

  getById: asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }
    res.json({ success: true, data: customer });
  }),
};

module.exports = customerController;
