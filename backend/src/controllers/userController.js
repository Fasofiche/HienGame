const pool = require('../config/database');

async function getMyEntitlements(req, res) {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT
         ue.id,
         ue.product_id,
         ue.order_id,
         ue.created_at,
         p.name,
         p.slug,
         p.platform,
         p.price_xof,
         p.image_url
       FROM user_entitlements ue
       INNER JOIN products p ON p.id = ue.product_id
       WHERE ue.user_id = $1
       ORDER BY ue.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      entitlements: result.rows,
    });
  } catch (error) {
    console.error('Erreur getMyEntitlements:', error.message);

    res.status(500).json({
      success: false,
      message: 'Impossible de récupérer vos jeux.',
    });
  }
}

async function checkProductOwnership(req, res) {
  try {
    const userId = req.user.userId;
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant de produit invalide.',
      });
    }

    const result = await pool.query(
      `SELECT id
       FROM user_entitlements
       WHERE user_id = $1 AND product_id = $2`,
      [userId, productId]
    );

    res.json({
      success: true,
      owned: result.rows.length > 0,
    });
  } catch (error) {
    console.error('Erreur checkProductOwnership:', error.message);

    res.status(500).json({
      success: false,
      message: 'Impossible de vérifier la propriété du jeu.',
    });
  }
}

module.exports = {
  getMyEntitlements,
  checkProductOwnership,
};
