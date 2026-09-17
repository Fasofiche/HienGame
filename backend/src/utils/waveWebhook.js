const crypto = require('crypto');

function verifyWaveSignature(rawBody, waveSignature, secret) {
  if (!rawBody || !waveSignature || !secret) {
    return false;
  }

  const parts = waveSignature.split(',');

  const timestampPart = parts.find((part) => part.startsWith('t='));
  const signatures = parts
    .filter((part) => part.startsWith('v1='))
    .map((part) => part.substring(3));

  if (!timestampPart || signatures.length === 0) {
    return false;
  }

  const timestamp = timestampPart.substring(2);
  const timestampNumber = Number(timestamp);

  if (!Number.isInteger(timestampNumber)) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);

  if (timestampNumber < now - 300 || timestampNumber > now + 30) {
    return false;
  }

  const payload = timestamp + rawBody;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signatures.some((signature) => {
    if (signature.length !== expectedSignature.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expectedSignature, 'utf8')
    );
  });
}

module.exports = {
  verifyWaveSignature,
};
