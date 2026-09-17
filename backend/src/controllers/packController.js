const pool = require('../config/database');

async function getPacks(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.description,
        p.price_xof,
        p.image_url,
        p.is_active,
        p.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pr.id,
              'name', pr.name,
              'slug', pr.slug,
              'platform', pr.platform,
              'price_xof', pr.price_xof,
              'image_url', pr.image_url
            )
          ) FILTER (WHERE pr.id IS NOT NULL),
          '[]'
        ) AS products
      FROM packs p
      LEFT JOIN pack_items pi ON pi.pack_id = p.id
      LEFT JOIN products pr ON pr.id = pi.product_id
      WHERE p.is_active = TRUE
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    res.json({
      success: true,
      packs: result.rows,
    });
  } catch (error) {
    console.error('Erreur getPacks:', error.message);

    res.status(500).json({
      success: false,
      message: 'Impossible de récupérer les packs.',
    });
  }
}

module.exports = {
  getPacks,
};
