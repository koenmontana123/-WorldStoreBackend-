const Product = require("../models/Product");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().populate("seller", "fullName email shopName");
  res.json(products);
});

const approveProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.productId,
    { isApproved: true },
    { new: true }
  );
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json({ message: "Product approved successfully", product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json({ message: "Product deleted successfully" });
});

// For the legacy admin.html Quick Add
const quickAddProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, image } = req.body;
  
  // Find an admin or the first seller to attribute this product to
  let admin = await User.findOne({ role: "admin" });
  if (!admin) {
      admin = await User.findOne({ role: "seller" });
  }
  if (!admin) {
      res.status(400);
      throw new Error("No admin or seller found to attribute product to. Please seed the database.");
  }

  const product = new Product({
    name,
    description,
    price,
    category,
    image,
    seller: admin._id,
    isApproved: true
  });

  await product.save();
  res.status(201).json({ message: "Product added successfully", product });
});

module.exports = {
  getAllUsers,
  getAllProducts,
  approveProduct,
  deleteProduct,
  quickAddProduct
};

