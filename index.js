const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// ✅ Allow frontend from your real domain
app.use(cors({
  origin: 'https://camvo.shop'
}));

app.use(express.json());

// ✅ Load secrets from Render environment variables
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const SHOP = process.env.SHOP;

app.post('/create-draft-order', async (req, res) => {
  const { quantity, price } = req.body;

  // ✅ Validate incoming data
  if (!quantity || !price) {
    return res.status(400).json({ success: false, error: 'Missing quantity or price' });
  }

  try {
    // ✅ Create random order name like "ORDER N#8432"
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const orderTitle = `ORDER N#${orderNumber}`;

    // ✅ Create the draft order via Shopify API
    const response = await axios.post(
      `https://${SHOP}/admin/api/2025-04/draft_orders.json`,
      {
        draft_order: {
          line_items: [
            {
              title: orderTitle,
              price: price,
              quantity: parseInt(quantity),
              requires_shipping: false // ✅ Service or non-physical item
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

    // ✅ Return the checkout link to frontend
    const checkoutUrl = response.data.draft_order.invoice_url;
    res.json({ success: true, checkout_url: checkoutUrl });

  } catch (error) {
    console.error("❌ Shopify API error:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: 'Error creating draft order' });
  }
});

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
