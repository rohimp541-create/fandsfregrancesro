const express = require('express');
const productController = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', authenticateToken, productController.create);
router.put('/:id', authenticateToken, productController.update);
router.delete('/:id', authenticateToken, productController.delete);

module.exports = router;
