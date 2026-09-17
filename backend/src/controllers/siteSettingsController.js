const pool = require('../config/database');

async function getSiteSettings(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         id,
         site_name,
         logo_url,
         primary_color,
         secondary_color,
         background_color,
         orange_money_number,
         wave_number,
         payment_name,
         orange_instructions,
         wave_instructions,
         whatsapp_number,
         updated_at
       FROM site_settings
       ORDER BY id
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Paramètres du site introuvables.',
      });
    }

    return res.json({
      success: true,
      settings: result.rows[0],
    });
  } catch (error) {
    console.error('Erreur getSiteSettings:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Impossible de récupérer les paramètres du site.',
    });
  }
}

async function updateSiteSettings(req, res) {
  try {
    const {
      site_name,
      logo_url,
      primary_color,
      secondary_color,
      background_color,
      orange_money_number,
      wave_number,
      payment_name,
      orange_instructions,
      wave_instructions,
      whatsapp_number,
    } = req.body;

    const result = await pool.query(
      `UPDATE site_settings
       SET
         site_name = COALESCE($1, site_name),
         logo_url = $2,
         primary_color = COALESCE($3, primary_color),
         secondary_color = COALESCE($4, secondary_color),
         background_color = COALESCE($5, background_color),
         orange_money_number = $6,
         wave_number = $7,
         payment_name = $8,
         orange_instructions = $9,
         wave_instructions = $10,
         whatsapp_number = $11,
         updated_at = NOW()
       WHERE id = (
         SELECT id
         FROM site_settings
         ORDER BY id
         LIMIT 1
       )
       RETURNING *`,
      [
        site_name?.trim() || null,
        logo_url?.trim() || null,
        primary_color?.trim() || null,
        secondary_color?.trim() || null,
        background_color?.trim() || null,
        orange_money_number?.trim() || null,
        wave_number?.trim() || null,
        payment_name?.trim() || null,
        orange_instructions?.trim() || null,
        wave_instructions?.trim() || null,
        whatsapp_number?.trim() || null,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Paramètres du site introuvables.',
      });
    }

    return res.json({
      success: true,
      message: 'Paramètres du site mis à jour.',
      settings: result.rows[0],
    });
  } catch (error) {
    console.error('Erreur updateSiteSettings:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Impossible de mettre à jour les paramètres.',
    });
  }
}

module.exports = {
  getSiteSettings,
  updateSiteSettings,
};
