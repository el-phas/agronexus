import dotenv from 'dotenv';
import sequelize from '../config/database.js';
import { User, Farmer, Product, Category } from '../models/index.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    await sequelize.sync({ alter: true });
    console.log('Database synced');

    // Clear existing data
    await sequelize.truncate({ cascade: true });

    // Create categories
    const categories = await Category.bulkCreate([
      { name: 'Vegetables', description: 'Fresh vegetables' },
      { name: 'Fruits', description: 'Fresh fruits' },
      { name: 'Grains', description: 'Grains and cereals' },
      { name: 'Dairy', description: 'Dairy products' },
      { name: 'Poultry', description: 'Poultry products' },
    ]);

    // Create users
    const users = await User.bulkCreate([
      {
        username: 'john_farmer',
        email: 'john@example.com',
        password: 'password123',
        user_type: 'farmer',
        first_name: 'John',
        last_name: 'Mwangi',
      },
      {
        username: 'mary_farmer',
        email: 'mary@example.com',
        password: 'password123',
        user_type: 'farmer',
        first_name: 'Mary',
        last_name: 'Wanjiku',
      },
      {
        username: 'buyer_user',
        email: 'buyer@example.com',
        password: 'password123',
        user_type: 'buyer',
        first_name: 'James',
        last_name: 'Kariuki',
      },
    ]);

    // Create farmer profiles
    await Farmer.bulkCreate([
      {
        user_id: users[0].id,
        location: 'Kiambu, Kenya',
        farm_name: 'Green Valley Farm',
        bio: 'Growing fresh organic vegetables',
        verification_status: 'verified',
      },
      {
        user_id: users[1].id,
        location: 'Nakuru, Kenya',
        farm_name: 'Harvest Dreams Farm',
        bio: 'Quality grains and cereals',
        verification_status: 'verified',
      },
    ]);

    // Create products
    await Product.bulkCreate([
      {
        farmer_id: 1,
        name: 'Fresh Organic Tomatoes',
        description: 'Freshly picked ripe tomatoes',
        category: 'Vegetables',
        price: 120,
        unit: 'kg',
        available_quantity: 500,
        image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop',
        is_organic: true,
        rating: 4.8,
      },
      {
        farmer_id: 1,
        name: 'Organic Green Beans',
        description: 'Fresh green beans',
        category: 'Vegetables',
        price: 150,
        unit: 'kg',
        available_quantity: 300,
        image_url: 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=400&h=300&fit=crop',
        is_organic: true,
        rating: 4.6,
      },
      {
        farmer_id: 2,
        name: 'Grade A Maize',
        description: 'High quality maize grain',
        category: 'Grains',
        price: 45,
        unit: 'kg',
        available_quantity: 2000,
        image_url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop',
        is_organic: false,
        rating: 4.9,
      },
      {
        farmer_id: 2,
        name: 'Premium Rice',
        description: 'Premium quality rice',
        category: 'Grains',
        price: 180,
        unit: 'kg',
        available_quantity: 5000,
        image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
        is_organic: false,
        rating: 4.8,
      },
    ]);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
