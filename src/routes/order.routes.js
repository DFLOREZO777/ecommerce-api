const express = require('express');
const { createOrder, getOrderTracking, getAllOrders, updateOrderStatus, updateOrderPayment } = require('../controllers/order.controller');
const router = express.Router();

router.post('/', createOrder);
router.get('/track/:code', getOrderTracking);

// Admin Routes (add middleware in production)
router.get('/', getAllOrders);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/payment', updateOrderPayment);

module.exports = router;
