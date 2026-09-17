const pool = require('../config/database');

async function createPayment(req, res) {
  try {
    const userId = req.user.userId;
    const orderId = Number(req.body.order_id);
    const provider = req.body.provider;

    if (!Number.isInteger(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant de commande invalide.',
      });
    }

    if (!['wave', 'orange_money'].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: 'Moyen de paiement invalide.',
      });
    }

    const result = await pool.query(
      `SELECT id, total_xof, status
       FROM orders
       WHERE id = $1 AND user_id = $2`,
      [orderId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Commande introuvable.',
      });
    }

    const order = result.rows[0];

    if (order.status !== 'pending') {
      return res.status(409).json({
        success: false,
        message: 'Cette commande ne peut plus être payée.',
      });
    }

    const payment = await pool.query(
      `INSERT INTO payments
       (order_id, provider, amount_xof, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING id, order_id, provider, amount_xof, status, created_at`,
      [order.id, provider, order.total_xof]
    );

    return res.status(201).json({
      success: true,
      message: 'Paiement préparé.',
      payment: payment.rows[0],
    });
  } catch (error) {
    console.error('Erreur createPayment:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Impossible de préparer le paiement.',
    });
  }
}

module.exports = {
  createPayment,
};
