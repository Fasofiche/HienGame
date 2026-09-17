const pool = require('../config/database');

async function getProducts(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        slug,
        description,
        platform,
        price_xof,
        image_url,
        product_type,
        genre,
        edition,
        trailer_url,
        is_featured,
        is_active,
        created_at
      FROM products
      WHERE is_active = TRUE
      ORDER BY created_at DESC
    `);

    return res.json({
      success: true,
      products: result.rows,
    });
  } catch (error) {
    console.error('Erreur getProducts:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Impossible de récupérer les produits.',
    });
  }
}

async function createProduct(req, res) {
  try {
    const {
      name,
      slug,
      description,
      platform,
      price_xof,
      image_url,
      product_type,
      genre,
      edition,
      trailer_url,
      is_featured,
    } = req.body;

    if (!name?.trim() || !slug?.trim() || !platform?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nom, slug et plateforme sont obligatoires.',
      });
    }

    const price = Number(price_xof);

    if (!Number.isInteger(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Le prix doit être un entier positif ou nul.',
      });
    }

    const featured =
      is_featured === true ||
      is_featured === 'true';

    const result = await pool.query(
      `INSERT INTO products
       (
         name,
         slug,
         description,
         platform,
         price_xof,
         image_url,
         product_type,
         genre,
         edition,
         trailer_url,
         is_featured
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        name.trim(),
        slug.trim().toLowerCase(),
        description?.trim() || null,
        platform.trim(),
        price,
        image_url?.trim() || null,
        product_type?.trim() || 'game',
        genre?.trim() || null,
        edition?.trim() || null,
        trailer_url?.trim() || null,
        featured,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Produit créé avec succès.',
      product: result.rows[0],
    });
  } catch (error) {
    console.error('Erreur createProduct:', error.message);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Ce slug existe déjà.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Impossible de créer le produit.',
    });
  }
}

module.exports = {
  getProducts,
  createProduct,
};
