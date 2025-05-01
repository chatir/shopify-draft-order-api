const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// ─── CORS & JSON PARSING ───────────────────────────────────────────────────────
app.use(cors({ origin: 'https://camvo.shop' }));
app.use(express.json());

// ─── DRAFT ORDER ROUTE ────────────────────────────────────────────────────────
app.post('/create-draft-order', async (req, res) => {
  const { quantity, price } = req.body;
  if (!quantity || !price) {
    return res.status(400).json({ success: false, error: 'Missing quantity or price' });
  }

  try {
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const orderTitle = `ORDER N#${orderNumber}`;

    const response = await axios.post(
      `https://${process.env.SHOP}/admin/api/2025-04/draft_orders.json`,
      {
        draft_order: {
          line_items: [{
            title: orderTitle,
            price,
            quantity: parseInt(quantity, 10),
            requires_shipping: false
          }],
        
          allow_discount_codes: true,
          accept_automatic_discounts: false,
          tags: 'Consult services',
          note: 'Consult services'
        }
      },
      {
        headers: {
          'X-Shopify-Access-Token': process.env.ACCESS_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ success: true, checkout_url: response.data.draft_order.invoice_url });
  } catch (error) {
    console.error("❌ Shopify API error:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: 'Error creating draft order' });
  }
});

// ─── START SERVER ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
