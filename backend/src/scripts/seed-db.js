import dotenv from 'dotenv';
import mongoose from '../config/database.js';
import { User, Farmer, Product, Category } from '../models/index.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await new Promise((res, rej) => {
        mongoose.connection.once('open', res);
        mongoose.connection.once('error', rej);
      });
    }
    console.log('MongoDB connection established');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Farmer.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
    ]);

    // Create categories
    const categories = await Category.create([
      { name: 'Vegetables', description: 'Fresh vegetables' },
      { name: 'Fruits', description: 'Fresh fruits' },
      { name: 'Grains', description: 'Grains and cereals' },
      { name: 'Dairy', description: 'Dairy products' },
      { name: 'Poultry', description: 'Poultry products' },
    ]);

    // Create users
    const users = await User.create([
      { username: 'john_farmer', email: 'john@example.com', password: 'password123', user_type: 'farmer', first_name: 'John', last_name: 'Mwangi' },
      { username: 'mary_farmer', email: 'mary@example.com', password: 'password123', user_type: 'farmer', first_name: 'Mary', last_name: 'Wanjiku' },
      { username: 'buyer_user', email: 'buyer@example.com', password: 'password123', user_type: 'buyer', first_name: 'James', last_name: 'Kariuki' },
    ]);

    // Create farmer profiles linked to users
    await Farmer.create([
      { user_id: users[0]._id, location: 'Kiambu, Kenya', farm_name: 'Green Valley Farm', bio: 'Growing fresh organic vegetables', verification_status: 'verified' },
      { user_id: users[1]._id, location: 'Nakuru, Kenya', farm_name: 'Harvest Dreams Farm', bio: 'Quality grains and cereals', verification_status: 'verified' },
    ]);

    // Create products
    await Product.create([
      { farmer_id: users[0]._id, name: 'Fresh Organic Tomatoes', description: 'Freshly picked ripe tomatoes', category: 'Vegetables', price: 120, unit: 'kg', available_quantity: 500, image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop', is_organic: true, rating: 4.8 },
      { farmer_id: users[0]._id, name: 'Organic Green Beans', description: 'Fresh green beans', category: 'Vegetables', price: 150, unit: 'kg', available_quantity: 300, image_url: 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=400&h=300&fit=crop', is_organic: true, rating: 4.6 },
      { farmer_id: users[1]._id, name: 'Grade A Maize', description: 'High quality maize grain', category: 'Grains', price: 45, unit: 'kg', available_quantity: 2000, image_url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop', is_organic: false, rating: 4.9 },
      { farmer_id: users[1]._id, name: 'Premium Rice', description: 'Premium quality rice', category: 'Grains', price: 180, unit: 'kg', available_quantity: 5000, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop', is_organic: false, rating: 4.8 },
    ]);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
