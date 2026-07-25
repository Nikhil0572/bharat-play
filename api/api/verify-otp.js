// POST /api/verify-otp
// Body: { token: "...", otp: "123456" }
// Verifies the signed token from /api/send-otp and checks the OTP matches
// and hasn't expired.

const crypto = require('crypto');

function verify(token) {
  const secret = process.env.OTP_SECRET;
  const [b64, hmac] = String(token || '').split('.');
  if (!b64 || !hmac) return null;

  const data = Buffer.from(b64, 'base64').toString('utf8');
  const expectedHmac = crypto.createHmac('sha256', secret).update(data).digest('hex');

  // Constant-time comparison to avoid timing attacks
  const a = Buffer.from(hmac);
  const b = Buffer.from(expectedHmac);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { token, otp } = req.body || {};
    const payload = verify(token);

    if (!payload) {
      res.status(400).json({ success: false, error: 'Invalid or tampered token' });
      return;
    }
    if (Date.now() > payload.expiresAt) {
      res.status(400).json({ success: false, error: 'OTP expired, please request a new one' });
      return;
    }
    if (String(otp) !== String(payload.otp)) {
      res.status(400).json({ success: false, error: 'Incorrect OTP' });
      return;
    }

    res.status(200).json({ success: true, phone: payload.phone });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
