const { randomBytes } = require('crypto');

const CAPTCHAS = new Map();

const randomString = (length = 6) =>
  randomBytes(length)
    .toString('base64')
    .replace(/[^A-Z0-9]/gi, '')
    .slice(0, length)
    .toUpperCase();

const ttlMinutes = () => Number(process.env.CAPTCHA_TTL_MINUTES || 10);

const cleanupExpired = () => {
  const now = Date.now();
  for (const [token, { expiresAt }] of CAPTCHAS.entries()) {
    if (expiresAt <= now) {
      CAPTCHAS.delete(token);
    }
  }
};

const generateCaptcha = () => {
  cleanupExpired();
  const token = randomBytes(16).toString('hex');
  const text = randomString(6);
  const expiresAt = Date.now() + ttlMinutes() * 60 * 1000;
  CAPTCHAS.set(token, { text, expiresAt });
  return { token, text, expiresAt };
};

const verifyCaptcha = (token, text) => {
  cleanupExpired();
  if (!token || !text) return false;
  const record = CAPTCHAS.get(token);
  if (!record) return false;
  const isValid = record.text === text.toUpperCase();
  if (isValid) {
    CAPTCHAS.delete(token);
  }
  return isValid;
};

module.exports = {
  generateCaptcha,
  verifyCaptcha
};

