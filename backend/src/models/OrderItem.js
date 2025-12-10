import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: DataTypes.DECIMAL(10, 2),
  unit_price: DataTypes.DECIMAL(10, 2),
  subtotal: DataTypes.DECIMAL(10, 2),
}, {
  tableName: 'order_items',
  timestamps: false,
  underscored: true,
});

export default OrderItem;
