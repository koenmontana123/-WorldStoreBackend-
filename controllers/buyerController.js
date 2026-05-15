const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const browseProducts = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 10 } = req.query;
  const query = { isApproved: true }; // Only show approved products to buyers

  if (category) query.category = category;
  if (search) query.name = { $regex: search, $options: "i" };

  const skip = (page - 1) * limit;
  const products = await Product.find(query)
    .populate("seller", "shopName email")
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments(query);

  res.json({
    products,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    },
  });
});

const getProductDetail = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId)
    .populate("seller", "shopName email phone")
    .populate("reviews.buyer", "fullName");

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json(product);
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error("Invalid quantity. Must be at least 1.");
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (!product.isApproved) {
    res.status(403);
    throw new Error("This product is not currently available for purchase");
  }

  if (product.stock < quantity) {
    res.status(400);
    throw new Error(`Insufficient stock. Only ${product.stock} items left.`);
  }

  let cart = await Cart.findOne({ buyer: req.user.id });
  if (!cart) {
    cart = new Cart({ buyer: req.user.id, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      price: product.price,
    });
  }

  cart.totalAmount = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  await cart.save();
  res.json({ message: "Item added to cart successfully", cart });
});

const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ buyer: req.user.id }).populate(
    "items.product"
  );
  res.json(cart || { items: [], totalAmount: 0 });
});

const checkout = asyncHandler(async (req, res) => {
  const { shippingAddress } = req.body;

  if (!shippingAddress) {
    res.status(400);
    throw new Error("Shipping address is required for checkout");
  }

  const cart = await Cart.findOne({ buyer: req.user.id }).populate(
    "items.product"
  );

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Your cart is empty");
  }

  const ordersBySeller = {};

  // Group items by seller and check stock
  for (const item of cart.items) {
    const product = item.product;
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    const sellerId = product.seller.toString();
    if (!ordersBySeller[sellerId]) {
      ordersBySeller[sellerId] = {
        buyer: req.user.id,
        seller: sellerId,
        products: [],
        totalAmount: 0,
        shippingAddress
      };
    }
    
    ordersBySeller[sellerId].products.push({
      product: product._id,
      quantity: item.quantity,
      price: item.price,
    });
    ordersBySeller[sellerId].totalAmount += item.price * item.quantity;
  }

  const createdOrders = [];
  for (const sellerOrder of Object.values(ordersBySeller)) {
    const order = new Order(sellerOrder);
    await order.save();
    
    // Update stock
    for (const item of sellerOrder.products) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity }
        });
    }

    createdOrders.push(order);
  }

  // Clear cart
  await Cart.deleteOne({ buyer: req.user.id });

  res.status(201).json({
    message: "Orders placed successfully",
    orders: createdOrders,
  });
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user.id })
    .populate("products.product")
    .populate("seller", "shopName email")
    .sort({ createdAt: -1 });
  res.json(orders);
});

const addReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error("Rating must be between 1 and 5");
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Optional: Check if buyer actually bought the product
  const hasBought = await Order.findOne({
    buyer: req.user.id,
    'products.product': productId,
    paymentStatus: 'paid'
  });

  if (!hasBought) {
    res.status(403);
    throw new Error("You can only review products you have purchased and paid for");
  }

  product.reviews.push({
    buyer: req.user.id,
    rating,
    comment: comment || "",
  });

  const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
  product.rating = totalRating / product.reviews.length;

  await product.save();
  res.json({ message: "Review added successfully", product });
});

module.exports = {
  browseProducts,
  getProductDetail,
  addToCart,
  getCart,
  checkout,
  getOrders,
  addReview,
};

