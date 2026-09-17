const pool = require('../config/database');

async function createOrder(req, res) {
  const client = await pool.connect();

  try {
    const userId = req.user.userId;
    const { product_id } = req.body;
    const productId = Number(product_id);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant de produit invalide.',
      });
    }

    await client.query('BEGIN');

    const productResult = await client.query(
      `SELECT id, name, price_xof
       FROM products
       WHERE id = $1 AND is_active = TRUE
       FOR UPDATE`,
      [productId]
    );

    if (productResult.rows.length === 0) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        success: false,
        message: 'Produit introuvable ou indisponible.',
      });
    }

    const product = productResult.rows[0];

    const ownershipResult = await client.query(
      `SELECT id
       FROM user_entitlements
       WHERE user_id = $1 AND product_id = $2`,
      [userId, productId]
    );

    if (ownershipResult.rows.length > 0) {
      await client.query('ROLLBACK');

      return res.status(409).json({
        success: false,
        message: 'Vous possédez déjà ce jeu.',
      });
    }

    const stockResult = await client.query(
      `SELECT id
       FROM digital_inventory
       WHERE product_id = $1
         AND status = 'available'
       LIMIT 1`,
      [productId]
    );

    if (stockResult.rows.length === 0) {
      await client.query('ROLLBACK');

      return res.status(409).json({
        success: false,
        message: 'Ce jeu est actuellement en rupture de stock.',
      });
    }

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_xof, status)
       VALUES ($1, $2, 'pending')
       RETURNING id, user_id, total_xof, status, created_at`,
      [userId, product.price_xof]
    );

    const order = orderResult.rows[0];

    await client.query(
      `INSERT INTO order_items
       (order_id, product_id, quantity, unit_price_xof)
       VALUES ($1, $2, 1, $3)`,
      [order.id, productId, product.price_xof]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Commande créée avec succès.',
      order,
      product: {
        id: product.id,
        name: product.name,
        price_xof: product.price_xof,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');

    console.error('Erreur createOrder:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Impossible de créer la commande.',
    });
  } finally {
    client.release();
  }
}

module.exports = {
  createOrder,
};
