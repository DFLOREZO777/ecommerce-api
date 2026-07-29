const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  customerAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deliveryDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Recibido', 'En proceso', 'Entregado'),
    defaultValue: 'Recibido',
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  paymentStatus: {
    type: DataTypes.ENUM('Pendiente', 'Pagado', 'No pagado'),
    defaultValue: 'Pendiente',
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  trackingCode: {
    type: DataTypes.STRING,
    unique: true,
  }
}, {
  timestamps: true,
});

module.exports = Order;
