const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(req, res, next) {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "Thiếu token từ Google" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    req.googleUser = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };

    next(); // chuyển sang controller
  } catch (err) {
    console.error("Xác thực Google thất bại:", err.message);
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
}

module.exports = { verifyGoogleToken };
