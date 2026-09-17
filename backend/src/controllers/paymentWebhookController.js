const { verifyWaveSignature } = require('../utils/waveWebhook');

async function handlePaymentWebhook(req, res) {
  try {
    const signature = req.headers['wave-signature'];
    const secret = process.env.WAVE_WEBHOOK_SECRET;

    const isValid = verifyWaveSignature(
      req.rawBody,
      signature,
      secret
    );

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Signature webhook invalide.',
      });
    }

    console.log('Webhook Wave authentifié:', req.body);

    return res.status(200).json({
      success: true,
      message: 'Webhook authentifié.',
    });
  } catch (error) {
    console.error('Erreur webhook Wave:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement du webhook.',
    });
  }
}

module.exports = {
  handlePaymentWebhook,
};
