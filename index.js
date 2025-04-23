const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors({
  origin: 'https://camvo.shop'
}));

app.use(express.json());

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const SHOP = process.env.SHOP;

app.post('/create-draft-order', async (req, res) => {
  const { quantity, price } = req.body;

  if (!quantity || !price) {
    return res.status(400).json({ success: false, error: 'Missing quantity or price' });
  }

  try {
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const orderTitle = `ORDER N#${orderNumber}`;

    const response = await axios.post(
      `https://${SHOP}/admin/api/2025-04/draft_orders.json`,
      {
        draft_order: {
          line_items: [
            {
              title: orderTitle,
              price: price,
              quantity: parseInt(quantity)
            }
          ]
        }
      },
      {
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

    const checkoutUrl = response.data.draft_order.invoice_url;
    res.json({ success: true, checkout_url: checkoutUrl });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ success: false, error: 'Error creating custom draft order' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
