const pool = require('../config/database');

async function addCodes(req, res) {
  try {
    const productId = Number(req.body.product_id);
    let codes = req.body.license_codes;

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant de produit invalide.',
      });
    }

    if (!Array.isArray(codes)) {
      codes = [req.body.license_code];
    }

    codes = [...new Set(
      codes
        .filter(code => typeof code === 'string')
        .map(code => code.trim())
        .filter(Boolean)
    )];

    if (codes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Au moins un code est obligatoire.',
      });
    }

    const product = await pool.query(
      'SELECT id FROM products WHERE id = $1',
      [productId]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produit introuvable.',
      });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      let added = 0;
      let duplicates = 0;

      for (const code of codes) {
        const result = await client.query(
          `INSERT INTO digital_inventory
           (product_id, license_code)
           VALUES ($1, $2)
           ON CONFLICT (product_id, license_code) DO NOTHING`,
          [productId, code]
        );

        if (result.rowCount === 1) {
          added++;
        } else {
          duplicates++;
        }
      }

      await client.query('COMMIT');

      return res.status(201).json({
        success: true,
        message: 'Import du stock terminé.',
        added,
        duplicates,
        total_received: codes.length,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur addCodes:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Impossible d’importer les codes.',
    });
  }
}

async function getInventory(req, res) {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant de produit invalide.',
      });
    }

    const result = await pool.query(
      `SELECT
         id,
         product_id,
         status,
         order_id,
         created_at
       FROM digital_inventory
       WHERE product_id = $1
       ORDER BY created_at DESC`,
      [productId]
    );

    const available = result.rows.filter(
      item => item.status === 'available'
    ).length;

    return res.json({
      success: true,
      inventory: result.rows,
      total: result.rows.length,
      available,
      used: result.rows.length - available,
    });
  } catch (error) {
    console.error('Erreur getInventory:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Impossible de récupérer le stock.',
    });
  }
}

module.exports = {
  addCodes,
  getInventory,
};
