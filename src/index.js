require('dotenv').config();
const express = require('express');
const { handleWebhook } = require('./webhook/handler');

const app = express();
const PORT = process.env.PORT || 3000;

// Raw body needed for GitHub webhook signature verification
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Slate Bot',
    version: '0.1.0',
    message: 'Push a .spec.md file to trigger Slate.'
  });
});

// GitHub webhook endpoint
app.post('/webhook', handleWebhook);

app.listen(PORT, () => {
  console.log(`🎨 Slate Bot running on port ${PORT}`);
  console.log(`🎡 Webhook endpoint: POST /webhook`);
});