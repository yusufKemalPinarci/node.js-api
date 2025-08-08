const express = require('express');
const bcrypt = require('bcrypt');
const { User, UserRole } = require('../models/User');
const { generateToken } = require('../helpers/jwtService');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    email = email.toLowerCase(); 
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
    email = email.toLowerCase(); 
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

const authMiddleware = require('../middlewares/auth');

router.post('/select-shop', authMiddleware, async (req, res) => {
  try {
    const { shopId } = req.body;

    if (!shopId) return res.status(400).json({ error: 'shopId is required' });

    const user = req.user;
    user.shopId = shopId;
    await user.save();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        //isEmailVerified: false, // veya kendi verine göre
        //phone: '',              // varsayılan değer
        //isPhoneVerified: false,
        //avatarUrl: null,
        shopId: user.shopId,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// usera telefeon ekleme
router.put('/:id/phone', async (req, res) => {
  try {
    const { phone } = req.body;

    // Telefon numarası kontrolü
    if (!phone || phone.trim() === '') {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { phone },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Phone updated successfully', phone: user.phone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// /api/user/exists?email=xxx@example.com
router.get('/exists', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ exists: false });

  const user = await User.findOne({ email: email.toLowerCase() });
  res.json({ exists: !!user });
});


router.get('/', async (req, res) => {
  const users = await User.find().select('-passwordHash');
  res.json(users);
});

module.exports = router;
