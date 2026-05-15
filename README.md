# WorldStore - Professional E-Commerce Platform

A full-featured Express + MongoDB e-commerce backend with separate seller and buyer portals, user authentication, and order management.

## Features

- **Multi-Portal System**: Separate authentication and portals for sellers and buyers
- **User Authentication**: JWT-based authentication with role-based access control (RBAC)
- **Seller Portal**: List products with approval workflow
- **Buyer Portal**: Browse products, add to cart, checkout, place orders, and leave reviews
- **Product Management**: Full CRUD operations for sellers
- **Order Management**: Order tracking, payment status, and shipping
- **Review System**: Product ratings and buyer reviews

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
copy .env.example .env
```

Update in `.env`:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Change to a strong secret key for production
- `PORT`: Server port (default: 5000)
- `CORS_ORIGIN`: Allowed cross-origin domains

### 3. Seed Sample Data

```bash
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

Server runs at `http://localhost:5000`

## API Documentation

### Authentication Endpoints

#### Register User

```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "buyer" // or "seller"
}

Response:
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": { ... }
}
```

### Seller Endpoints

All seller endpoints require authentication with `Authorization: Bearer <token>`

#### List Products (Seller's)

```
GET /api/seller/products
Authorization: Bearer <token>
```

#### Create Product Listing

```
POST /api/seller/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "price": 29.99,
  "category": "Electronics",
  "stock": 50,
  "image": "/public/images/product.jpg"
}
```

#### Update Product

```
PUT /api/seller/products/:productId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 39.99,
  "stock": 30
}
```

#### Delete Product

```
DELETE /api/seller/products/:productId
Authorization: Bearer <token>
```

### Buyer Endpoints

#### Browse Products (Public)

```
GET /api/buyer/products?category=Electronics&search=laptop&page=1&limit=10
```

#### Get Product Details (Public)

```
GET /api/buyer/products/:productId
```

#### Add to Cart

```
POST /api/buyer/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id_here",
  "quantity": 2
}
```

#### View Cart

```
GET /api/buyer/cart
Authorization: Bearer <token>
```

#### Checkout

```
POST /api/buyer/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "shippingAddress": "123 Main St, City, Country"
}

Response:
{
  "message": "Order placed successfully",
  "orders": [ ... ]
}
```

#### View Orders

```
GET /api/buyer/orders
Authorization: Bearer <token>
```

#### Add Review

```
POST /api/buyer/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id_here",
  "rating": 5,
  "comment": "Great product!"
}
```

### M-Pesa Integration (Daraja API)

The platform features a "super unique" and robust M-Pesa payment system:

- **STK Push (Lipa na M-Pesa Online)**: Automated prompts sent to buyers' phones.
- **Aggregated Payments**: Supports carts with products from multiple sellers, handled as a single M-Pesa transaction.
- **Real-time Status Polling**: The frontend automatically tracks payment status until confirmed.
- **Transaction Logging**: Detailed logs of all M-Pesa interactions in the `MpesaTransaction` model.
- **Status Querying**: Manual status verification via Daraja's Query API if callbacks are delayed.

#### Payment Endpoints

- `POST /api/payment/mpesa/stkpush`: Initiate an STK push.
- `GET /api/payment/mpesa/status/:checkoutRequestId`: Check the status of a transaction.
- `GET /api/payment/mpesa/history`: View recent M-Pesa transaction logs.
- `POST /api/payment/mpesa/callback`: Public endpoint for M-Pesa callback notifications.

## Project Structure

```
WorldStoreBackend/
├── models/              # Database schemas
│   ├── User.js         # User model with roles
│   ├── Product.js      # Product listings
│   ├── Cart.js         # Shopping cart
│   └── Order.js        # Orders
├── routes/             # API route handlers
│   ├── auth.js         # Authentication routes
│   ├── seller.js       # Seller portal routes
│   └── buyer.js        # Buyer portal routes
├── controllers/        # Business logic
│   ├── authController.js
│   ├── sellerController.js
│   └── buyerController.js
├── middleware/         # Express middleware
│   └── auth.js         # JWT authentication & RBAC
├── config/             # Configuration files
└── server.js           # Express app entry point
```

## Environment Variables

```
MONGODB_URI=mongodb://127.0.0.1:27017/worldstore
JWT_SECRET=your_secret_key_here
PORT=5000
CORS_ORIGIN=*
```

## Scripts

- `npm run dev` - Start development server with auto-reload (requires nodemon)
- `npm run start` - Start production server
- `npm run seed` - Populate sample data

## Key Features

### Role-Based Access Control

- **Buyer**: Browse products, add to cart, place orders, leave reviews
- **Seller**: Manage product listings (create, update, delete)
- **Admin**: Full system access (can be implemented)

### Product Approval Workflow

Products are created with `isApproved: false` and only appear to buyers after admin approval.

### Cart & Checkout

- Add items to cart
- One checkout creates multiple orders (one per seller)
- Track order status and payment

### Reviews & Ratings

Buyers can leave reviews on products they've purchased, which updates product rating.

## Deployment Guide (Going Live)

To make WorldStore accessible to everyone on the internet, follow these steps:

### 1. Database Migration (MongoDB Atlas)
Since you are currently using a local database, you need to move to the cloud:
1. Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster and get your **Connection String**.
3. In your Atlas dashboard, go to "Network Access" and allow access from `0.0.0.0/0` (for hosting services).

### 2. Prepare for Hosting
1. Push your code to a **GitHub** repository.
2. Create a free account on [Render.com](https://render.com).
3. Click **New +** > **Web Service**.
4. Connect your GitHub repository.

### 3. Configure Environment Variables
On Render (or your chosen host), add the following Environment Variables:
- `MONGODB_URI`: Your MongoDB Atlas connection string.
- `JWT_SECRET`: A long, random string for security.
- `PORT`: 5000 (Render will often provide this automatically).
- `MPESA_CONSUMER_KEY`: Your Daraja API key.
- `MPESA_CONSUMER_SECRET`: Your Daraja API secret.

### 4. Build & Start Commands
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

Once deployed, Render will provide you with a URL like `https://world-store.onrender.com`.

---

## Technical Features Overview
- **Earthy Aesthetic**: Custom UI using Sage Green, Terracotta, and Warm Neutrals.
- **Dynamic Payouts**: Automated M-Pesa routing based on seller profile metadata.
- **Dual Image Support**: Handle local device uploads or web-linked URLs.
- **Modular Backend**: Clean separation of concerns with Express routers and controllers.
