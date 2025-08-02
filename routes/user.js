const express = require('express');
const bcrypt = require('bcrypt');
const { User, UserRole } = require('../models/User');
const { generateToken } = require('../helpers/jwtService');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({ name, email, passwordHash, role: role || UserRole.CUSTOMER });
    await user.save();

    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ error: 'Invalid email or password' });

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/select-shop', async (req, res) => {
  const { shopId } = req.body;
  const userId = req.user.id; // JWT'den geliyor

  if (!shopId) {
    return res.status(400).json({ message: 'shopId is required' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { shopId },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      message: 'Shop selected successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        shopId: user.shopId,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/', async (req, res) => {
  const users = await User.find().select('-passwordHash');
  res.json(users);
});

module.exports = router;
