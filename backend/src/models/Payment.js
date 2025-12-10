import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'KES',
  },
  payment_method: {
    type: DataTypes.ENUM('mpesa', 'bank_transfer', 'wallet'),
    allowNull: false,
    defaultValue: 'mpesa',
  },
  status: {
    type: DataTypes.ENUM('initiated', 'pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'initiated',
  },
  merchant_request_id: DataTypes.STRING(255),
  checkout_request_id: DataTypes.STRING(255),
  phone_number: DataTypes.STRING(20),
  result_code: DataTypes.INTEGER,
  result_description: DataTypes.TEXT,
  receipt_number: DataTypes.STRING(100),
  transaction_date: DataTypes.DATE,
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  initiated_at: DataTypes.DATE,
  completed_at: DataTypes.DATE,
  failed_at: DataTypes.DATE,
}, {
  tableName: 'payments',
  timestamps: true,
  underscored: true,
});

export default Payment;
