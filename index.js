const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

app.use(express.json());

// MongoDB bağlantısı
const uri = 'mongodb+srv://ysfkmlpinarci:Yusuf123;@cluster0.7dnowrz.mongodb.net/';


mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Basit model tanımı
const MessageSchema = new mongoose.Schema({
  text: String
});
const Message = mongoose.model('Message', MessageSchema);

// Mesaj ekleme endpointi
app.post('/api/message', async (req, res) => {
  const { text } = req.body;
  const message = new Message({ text });
  await message.save();
  res.json({ success: true, message });
});

// Mesajları listeleme endpointi
app.get('/api/messages', async (req, res) => {
  const messages = await Message.find();
  res.json(messages);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
