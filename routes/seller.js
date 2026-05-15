const express = require("express");
const fs = require("fs");
const path = require("path");
const { authenticate, authorize } = require("../middleware/auth");
const {
  createProduct,
  getSellerProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/sellerController");
const multer = require("multer");

const router = express.Router();

const uploadDirectory = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Configure Multer for device uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.use(authenticate);
router.use(authorize("seller", "admin"));

// Image upload endpoint
router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ imageUrl: `/public/uploads/${req.file.filename}` });
});

router.post("/products", createProduct);
router.get("/products", getSellerProducts);
router.put("/products/:productId", updateProduct);
router.delete("/products/:productId", deleteProduct);

module.exports = router;
