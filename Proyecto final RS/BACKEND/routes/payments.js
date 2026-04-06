const express = require('express');
const router = express.Router();
const { MercadoPagoConfig, Preference } = require('mercadopago');

// El Access Token se toma de tu archivo .env
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN 
});

router.post('/create_preference', async (req, res) => {
  try {
    const { items, total } = req.body;

    const preference = new Preference(client);
    
    const body = {
      items: items.map(item => ({
        title: item.title,
        unit_price: Number(item.unit_price),
        quantity: Number(item.quantity),
        currency_id: 'ARS'
      })),
      back_urls: {
        success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/success`,
        failure: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/menu`,
        pending: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/menu`,
      },
      auto_return: 'approved',
    };

    const result = await preference.create({ body });

    // Devolvemos el ID y la URL para que el frontend pueda redirigir
    res.json({ 
      id: result.id,
      init_point: result.init_point 
    });

  } catch (error) {
    console.error('Error Mercado Pago:', error);
    res.status(500).json({ 
      message: 'Error al crear la preferencia de pago',
      error: error.message 
    });
  }
});

module.exports = router;
