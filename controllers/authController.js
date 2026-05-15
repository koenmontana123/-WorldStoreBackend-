const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const register = asyncHandler(async (req, res) => {
  const { email, password, fullName, role, phone, address, shopName, shopDescription } = req.body;

  if (!email || !password || !fullName) {
    res.status(400);
    throw new Error("Missing required fields: email, password, and fullName are mandatory");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("Email already registered");
  }

  const user = new User({
    email,
    password,
    fullName,
    role: role || "buyer",
    phone,
    address,
    shopName,
    shopDescription,
    payout_info: req.body.payout_info,
  });

  await user.save();

  const token = generateToken(user);
  res.status(201).json({
    message: "User registered successfully",
    token,
    user: user.toJSON(),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password required");
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user);
  res.json({
    message: "Login successful",
    token,
    user: user.toJSON(),
  });
});

module.exports = { register, login };

