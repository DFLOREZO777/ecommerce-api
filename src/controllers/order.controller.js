const { Order, OrderItem, Product } = require('../models');

const generateTrackingCode = () => {
  return 'TRK-' + Math.random().toString(36).substring(2, 6).toUpperCase();
};

const createOrder = async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, customerAddress, deliveryDate, items, paymentMethod, paymentStatus } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain items' });
    }

    let totalPrice = 0;
    const orderItemsData = [];

    for (let item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product with id ${item.productId} not found` });
      }
      
      const priceAtPurchase = product.price;
      totalPrice += priceAtPurchase * item.quantity;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        priceAtPurchase,
        customMessage: item.customMessage
      });
    }

    const trackingCode = generateTrackingCode();

    const order = await Order.create({
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      deliveryDate,
      totalPrice,
      trackingCode,
      paymentMethod,
      paymentStatus
    });

    for (let data of orderItemsData) {
      await OrderItem.create({
        orderId: order.id,
        ...data
      });
    }

    res.status(201).json({ message: 'Order created successfully', orderId: order.id, trackingCode });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getOrderTracking = async (req, res) => {
  try {
    const { code } = req.params;
    const order = await Order.findOne({ 
      where: { trackingCode: code },
      include: [{ model: OrderItem, as: 'items', include: [Product] }] 
    });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: OrderItem, as: 'items', include: [Product] }]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    await order.update({ status });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateOrderPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, paymentStatus } = req.body;

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Actualizar solo los campos enviados
    const updates = {};
    if (paymentMethod !== undefined) updates.paymentMethod = paymentMethod;
    if (paymentStatus !== undefined) updates.paymentStatus = paymentStatus;

    await order.update(updates);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createOrder, getOrderTracking, getAllOrders, updateOrderStatus, updateOrderPayment };
