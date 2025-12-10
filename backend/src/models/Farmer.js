import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Farmer = sequelize.define('Farmer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  farm_name: DataTypes.STRING(255),
  bio: DataTypes.TEXT,
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
  },
  total_reviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  verification_status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending',
  },
}, {
  tableName: 'farmers',
  timestamps: true,
  underscored: true,
});

export default Farmer;
