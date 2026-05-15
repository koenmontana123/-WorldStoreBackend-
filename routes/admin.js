const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const {
  getAllUsers,
  getAllProducts,
  approveProduct,
  deleteProduct,
  quickAddProduct
} = require("../controllers/adminController");

const router = express.Router();

// Legacy/Quick add route (unprotected for the simple admin.html)
router.post("/", quickAddProduct);

// Protected Admin routes
router.use(authenticate);
router.use(authorize("admin"));

router.get("/users", getAllUsers);
router.get("/products", getAllProducts);
router.put("/products/:productId/approve", approveProduct);
router.delete("/products/:productId", deleteProduct);

module.exports = router;
