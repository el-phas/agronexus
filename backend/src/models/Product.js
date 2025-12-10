import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  farmer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: DataTypes.TEXT,
  category: DataTypes.STRING(100),
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  unit: DataTypes.STRING(50),
  available_quantity: DataTypes.DECIMAL(10, 2),
  image_url: DataTypes.STRING(255),
  is_organic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
  },
  total_reviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'products',
  timestamps: true,
  underscored: true,
});

export default Product;
