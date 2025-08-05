require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');


const userRoutes = require('./routes/user');
const serviceRoutes = require('./routes/service');
const appointmentRoutes = require('./routes/appointment');
const shopRoutes = require('./routes/shop');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('MongoDB connection error:', err));


app.use(cors());
app.use('/api/shop', shopRoutes);
app.use('/api/user', userRoutes);
app.use('/api/service', serviceRoutes);
app.use('/api/appointment', appointmentRoutes);


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
