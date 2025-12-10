import User from './User.js';
import Farmer from './Farmer.js';
import Product from './Product.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Review from './Review.js';
import Category from './Category.js';
import Task from './Task.js';

// User relationships
User.hasOne(Farmer, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Farmer.belongsTo(User, { foreignKey: 'user_id' });

// Product relationships
Farmer.hasMany(Product, { foreignKey: 'farmer_id', onDelete: 'CASCADE' });
Product.belongsTo(Farmer, { foreignKey: 'farmer_id' });

// Order relationships
User.hasMany(Order, { as: 'BuyerOrders', foreignKey: 'buyer_id', onDelete: 'CASCADE' });
User.hasMany(Order, { as: 'SellerOrders', foreignKey: 'seller_id', onDelete: 'CASCADE' });
Order.belongsTo(User, { as: 'Buyer', foreignKey: 'buyer_id' });
Order.belongsTo(User, { as: 'Seller', foreignKey: 'seller_id' });

// Order Items
Order.hasMany(OrderItem, { foreignKey: 'order_id', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

// Review relationships
Product.hasMany(Review, { foreignKey: 'product_id', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'product_id' });
User.hasMany(Review, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'user_id' });

// Task relationships
Farmer.hasMany(Task, { foreignKey: 'farmer_id', onDelete: 'CASCADE' });
Task.belongsTo(Farmer, { foreignKey: 'farmer_id' });

export { User, Farmer, Product, Order, OrderItem, Review, Category, Task };
