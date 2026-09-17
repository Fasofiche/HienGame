const pool = require('../config/database');

async function fulfillPaidOrder(orderId, paymentId = null) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      `SELECT id, user_id, status
       FROM orders
       WHERE id = $1
       FOR UPDATE`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      throw new Error('Commande introuvable.');
    }

    const order = orderResult.rows[0];

    if (order.status === 'paid') {
      await client.query('ROLLBACK');

      return {
        alreadyFulfilled: true,
        message: 'Commande déjà traitée.',
      };
    }

    if (order.status !== 'pending') {
      throw new Error('La commande ne peut pas être validée.');
    }

    const itemsResult = await client.query(
      `SELECT product_id, quantity
       FROM order_items
       WHERE order_id = $1
         AND product_id IS NOT NULL`,
      [orderId]
    );

    if (itemsResult.rows.length === 0) {
      throw new Error('Aucun produit numérique dans cette commande.');
    }

    for (const item of itemsResult.rows) {
      for (let i = 0; i < item.quantity; i++) {
        const ownershipResult = await client.query(
          `SELECT id
           FROM user_entitlements
           WHERE user_id = $1 AND product_id = $2`,
          [order.user_id, item.product_id]
        );

        if (ownershipResult.rows.length > 0) {
          throw new Error('Le client possède déjà ce jeu.');
        }

        const stockResult = await client.query(
          `SELECT id
           FROM digital_inventory
           WHERE product_id = $1
             AND status = 'available'
           ORDER BY id
           LIMIT 1
           FOR UPDATE`,
          [item.product_id]
        );

        if (stockResult.rows.length === 0) {
          throw new Error('Stock numérique insuffisant.');
        }

        await client.query(
          `UPDATE digital_inventory
           SET status = 'used',
               order_id = $1
           WHERE id = $2`,
          [orderId, stockResult.rows[0].id]
        );

        await client.query(
          `INSERT INTO user_entitlements
           (user_id, product_id, order_id)
           VALUES ($1, $2, $3)`,
          [order.user_id, item.product_id, orderId]
        );
      }
    }

    await client.query(
      `UPDATE orders
       SET status = 'paid'
       WHERE id = $1`,
      [orderId]
    );

    if (paymentId) {
      await client.query(
        `UPDATE payments
         SET status = 'paid',
             updated_at = NOW()
         WHERE id = $1
           AND order_id = $2`,
        [paymentId, orderId]
      );
    }

    await client.query('COMMIT');

    return {
      alreadyFulfilled: false,
      message: 'Commande validée et jeux attribués.',
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  fulfillPaidOrder,
};
