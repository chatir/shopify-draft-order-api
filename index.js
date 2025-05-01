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
              quantity: parseInt(quantity, 10),
              requires_shipping: false
            }
          ],
          // 1. Custom order-level discount
          applied_discount: {
            title: 'Consult services',             // visible on the invoice
            description: 'Consult services',       // internal description
            value_type: 'fixed_amount',            // or 'percentage'
            value: price,                          // discount amount
            amount: price                          // total amount deducted
          },
          // 2. Allow customers to enter discount codes at checkout
          allow_discount_codes: true,
          // 3. Automatically apply any eligible automatic discounts
          accept_automatic_discounts: true,
          // 4. Tag the draft order for easy filtering
          tags: 'Consult services',
          // 5. Add an internal note
          note: 'Consult services'
        }
      },
      {
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
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
