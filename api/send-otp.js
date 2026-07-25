// POST /api/send-otp
// Body: { phone: "9876543210" }
// Generates a 6-digit OTP, sends it via Fast2SMS, and returns a signed
// token that encodes the OTP + expiry. We never store anything server
// side — the token itself (verified with a secret) is the "database".

const crypto = require('crypto');

function sign(payload) {
  const secret = process.env.OTP_SECRET;
  const data = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', secret).update(data).digest('hex');
  const token = Buffer.from(data).toString('base64') + '.' + hmac;
  return token;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { phone } = req.body || {};
    if (!/^[6-9]\d{9}$/.test(phone || '')) {
      res.status(400).json({ error: 'Invalid phone number' });
      return;
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(
      process.env.FAST2SMS_API_KEY
    )}&variables_values=${otp}&route=otp&numbers=${phone}`;

    const fast2smsRes = await fetch(url);
    const result = await fast2smsRes.json();

    if (!result.return) {
      res.status(502).json({ error: 'Could not send OTP', detail: result });
      return;
    }

    const token = sign({ phone, otp, expiresAt });
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
