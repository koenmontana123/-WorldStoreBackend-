const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const {
  browseProducts,
  getProductDetail,
  addToCart,
  getCart,
  checkout,
  getOrders,
  addReview,
} = require("../controllers/buyerController");

const router = express.Router();

router.get("/products", browseProducts);
router.get("/products/:productId", getProductDetail);

router.use(authenticate);
router.use(authorize("buyer", "admin"));

router.post("/cart", addToCart);
router.get("/cart", getCart);
router.post("/checkout", checkout);
router.get("/orders", getOrders);
router.post("/reviews", addReview);

module.exports = router;
