const cors = require('cors');

app.use(cors({
  origin: 'https://camvo.shop' // ✅ allow your front-end store
}));
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const SHOP = process.env.SHOP;

// ✅ POST /create-draft-order
app.post('/create-draft-order', async (req, res) => {
  const { variant_id, quantity } = req.body;

  if (!variant_id || !quantity) {
    return res.status(400).json({ success: false, error: 'Missing variant_id or quantity' });
  }

  try {
    const response = await axios.post(
      `https://${SHOP}/admin/api/2025-04/draft_orders.json`,
      {
        draft_order: {
          line_items: [
            {
              variant_id: parseInt(variant_id),
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
    res.status(500).json({ success: false, error: 'Error creating draft order' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
