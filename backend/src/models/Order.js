import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  buyer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  seller_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(
      'pending-payment',
      'payment-confirmed',
      'processing',
      'shipped',
      'delivered',
      'completed',
      'cancelled',
      'refunded'
    ),
    defaultValue: 'pending-payment',
  },
  payment_status: {
    type: DataTypes.ENUM('not-initiated', 'pending', 'paid', 'failed'),
    defaultValue: 'not-initiated',
  },
  delivery_address: DataTypes.TEXT,
  delivery_notes: DataTypes.TEXT,
  expected_delivery: DataTypes.DATE,
  cancellation_reason: DataTypes.TEXT,
  cancelled_by: DataTypes.ENUM('buyer', 'seller', 'admin'),
  cancellation_date: DataTypes.DATE,
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: 'orders',
  timestamps: true,
  underscored: true,
});

export default Order;
