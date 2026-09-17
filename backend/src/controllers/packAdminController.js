const pool = require('../config/database');

async function createPack(req, res) {
  try {
    const {
      name,
      slug,
      description,
      price_xof,
      image_url,
    } = req.body;

    if (!name || !slug || price_xof === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Nom, slug et prix sont obligatoires.',
      });
    }

    const result = await pool.query(
      `INSERT INTO packs
       (name, slug, description, price_xof, image_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        name.trim(),
        slug.trim().toLowerCase(),
        description || null,
        Number(price_xof),
        image_url || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Pack créé avec succès.',
      pack: result.rows[0],
    });
  } catch (error) {
    console.error('Erreur createPack:', error.message);

    res.status(500).json({
      success: false,
      message: 'Impossible de créer le pack.',
    });
  }
}

async function addProductToPack(req, res) {
  try {
    const packId = Number(req.params.packId);
    const productId = Number(req.body.product_id);

    if (!Number.isInteger(packId) || !Number.isInteger(productId)) {
      return res.status(400).json({
        success: false,
        message: 'packId et product_id doivent être des entiers.',
      });
    }

    const pack = await pool.query(
      'SELECT id FROM packs WHERE id = $1',
      [packId]
    );

    if (pack.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pack introuvable.',
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

    await pool.query(
      `INSERT INTO pack_items (pack_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (pack_id, product_id) DO NOTHING`,
      [packId, productId]
    );

    res.status(201).json({
      success: true,
      message: 'Jeu ajouté au pack avec succès.',
    });
  } catch (error) {
    console.error('Erreur addProductToPack:', error.message);

    res.status(500).json({
      success: false,
      message: 'Impossible d’ajouter le jeu au pack.',
    });
  }
}

module.exports = {
  createPack,
  addProductToPack,
};
