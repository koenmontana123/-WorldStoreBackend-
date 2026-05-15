const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock, image } = req.body;

  if (!name || !description || !price || !category || stock === undefined) {
    res.status(400);
    throw new Error("Missing required fields: name, description, price, category, and stock are required");
  }

  const product = new Product({
    name,
    description,
    price,
    category,
    stock,
    image,
    seller: req.user.id,
  });

  await product.save();
  res.status(201).json({
    message: "Product listed successfully! It will be live once approved by an admin.",
    product,
  });
});

const getSellerProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.user.id }).populate(
    "seller",
    "shopName email"
  );
  res.json(products);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error("You are not authorized to update this product");
  }

  Object.assign(product, req.body);
  await product.save();
  res.json({ message: "Product updated successfully", product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error("You are not authorized to delete this product");
  }

  await Product.deleteOne({ _id: req.params.productId });
  res.json({ message: "Product deleted successfully" });
});

module.exports = {
  createProduct,
  getSellerProducts,
  updateProduct,
  deleteProduct,
};

