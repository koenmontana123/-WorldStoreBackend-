const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/worldstore';

const sampleUsers = [
  {
    email: 'buyer@example.com',
    password: 'password123',
    fullName: 'John Buyer',
    role: 'buyer',
    phone: '+1234567890',
    address: '123 Main St, City, Country',
    isVerified: true,
  },
  {
    email: 'seller@example.com',
    password: 'password123',
    fullName: 'Jane Seller',
    role: 'seller',
    shopName: 'Premium Electronics',
    shopDescription: 'Quality electronics and gadgets',
    phone: '+0987654321',
    isVerified: true,
  },
];

const sampleProducts = [
  {
    name: 'Wireless Headphones',
    description: 'Premium noise-cancelling over-ear headphones with 30-hour battery life',
    price: 149.99,
    category: 'Electronics',
    stock: 25,
    image: '/public/images/headphones.jpg',
    isApproved: true,
    rating: 4.5,
  },
  {
    name: 'USB-C Hub',
    description: 'Multi-port USB-C hub with HDMI, USB 3.0, and SD card reader',
    price: 49.99,
    category: 'Electronics',
    stock: 50,
    image: '/public/images/usb-hub.jpg',
    isApproved: true,
    rating: 4.2,
  },
  {
    name: 'Phone Case',
    description: 'Protective phone case with shock absorption and scratch resistance',
    price: 19.99,
    category: 'Accessories',
    stock: 100,
    image: '/public/images/phone-case.jpg',
    isApproved: true,
    rating: 4.7,
  },
];

mongoose.connect(mongoUri)
  .then(async () => {
    console.log('Connected to', mongoUri);
    
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');
    
    // Create users
    const createdUsers = await User.create(sampleUsers);
    console.log(`Created ${createdUsers.length} sample users`);
    
    // Create products with seller reference
    const productsWithSeller = sampleProducts.map(p => ({
      ...p,
      seller: createdUsers[1]._id, // Seller user
    }));
    const createdProducts = await Product.create(productsWithSeller);
    console.log(`Created ${createdProducts.length} sample products`);
    
    console.log('\nSample Accounts:');
    console.log('Buyer: buyer@example.com / password123');
    console.log('Seller: seller@example.com / password123');
    
    return mongoose.disconnect();
  })
  .then(() => {
    console.log('\nSeed complete!');
  })
  .catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
