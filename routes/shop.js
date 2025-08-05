const express = require('express');
const Shop = require('../models/Shop');
const User = require('../models/User');
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

// Çalışana Ait Dükkanları listele      //berber için lazım
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



//Dükkanı id sine göre bilgilerini getirme   // hem müşteri hem berber tarafında lazım.
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


// Dükkanda çalışanları listeleme   //Müşteri tarafında lazım.
// GET /api/shop/:shopId/staff
// GET /api/shop/:shopId/staff - sadece çalışan email'lerini döner
router.get('/:shopId/staff', async (req, res) => {
  try {
    const shopId = req.params.shopId;

    const shop = await Shop.findById(shopId);

    if (!shop) {
      return res.status(404).json({ error: 'Dükkan bulunamadı' });
    }

    const staffEmails = (shop.staffEmails || [])
      .filter(email => typeof email === 'string');

    res.status(200).json(staffEmails);
  } catch (error) {
    console.error('Hata:', error);
    res.status(500).json({ error: 'Sunucu hatası', details: error.message });
  }
});







// Query ile dükkanları filtrele     // Müşteri tarafında lazım arama butonu için
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


// Tüm dükkanları getir (genel listeleme)    // Müşteri tarafında lazım
router.get('/', async (req, res) => {
  try {
    const shops = await Shop.find();
    res.json(shops);
  } catch (err) {
    console.error('Error fetching all shops:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


//dükkana çalışan ekleme          // Dükkan sahibi tarafında lazım.
// PUT /api/shop/:id/add-staff
router.put('/:id/add-staff', async (req, res) => {
  try {
    let { email } = req.body;
    email = email.toLowerCase(); // artık hata yok

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    if (shop.staffEmails.includes(email)) {
      return res.status(400).json({ message: 'This email is already added as staff.' });
    }

    shop.staffEmails.push(email);
    await shop.save();

    res.status(200).json({ message: 'Staff added successfully', shop });
  } catch (error) {
    console.error('Error adding staff:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});





module.exports = router;
