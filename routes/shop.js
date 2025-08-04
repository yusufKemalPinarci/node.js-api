const express = require('express');
const Shop = require('../models/Shop');

const router = express.Router();

// Create Shop
router.post('/', async (req, res) => {
  try {
    const {
      name,
      fullAddress,
      neighborhood,
      city,
      phone,
      adress,
      openingHour,
      closingHour,
      workingDays,
      ownerId,        // yeni alan
      staffEmails     // yeni alan
    } = req.body;

    const shop = new Shop({
      name,
      fullAddress,
      neighborhood,
      city,
      phone,
      adress,
      openingHour,
      closingHour,
      workingDays,
      ownerId,
      staffEmails
    });

    await shop.save();
    res.status(201).json(shop);
  } catch (err) {
    console.error('Shop create error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Dükkanları listele
// GET /api/shop/by-staff-email?email=test@example.com
router.get('/by-staff-email', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const shops = await Shop.find({ staffEmails: email });

    res.json(shops);
  } catch (err) {
    console.error('Error fetching shops by staff email:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const shop = await Shop.findById(id);

    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    res.status(200).json(shop);
  } catch (err) {
    console.error('Shop fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Query ile dükkanları filtrele
// GET /api/shop/search?city=Istanbul&neighborhood=Kadikoy&district=Moda
router.get('/search', async (req, res) => {
  try {
    const { city, neighborhood} = req.query;

    // Filtre objesi oluşturuyoruz, varsa ekliyoruz
    const filter = {};
    if (city) filter.city = city;
    if (neighborhood) filter.neighborhood = neighborhood;

    // Filtreye göre Shop'ları getir
    const shops = await Shop.find(filter);

    res.json(shops);
  } catch (err) {
    console.error('Error searching shops:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


// Tüm dükkanları getir (genel listeleme)
router.get('/', async (req, res) => {
  try {
    const shops = await Shop.find();
    res.json(shops);
  } catch (err) {
    console.error('Error fetching all shops:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});




module.exports = router;
