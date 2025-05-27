const userService = require("../services/user.service");
const authService = require("../services/auth.service");
const jwt = require("jsonwebtoken");

exports.googleLogin = async (req, res) => {
  const { email, name, picture } = req.googleUser;
  console.log("Google User:", req.googleUser);
  try {
    let user = await userService.findOrCreateGoogleUser({
      email,
      name,
      picture,
    });
    console.log("jwt_se :", process.env.JWT_SECRET);
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    console.log("token:", token);
    console.log("user:", user);
    res.status(200).json({ user, token });
  } catch (err) {
    console.error("Google login error:", err.message);
    res.status(500).json({ message: "Lỗi đăng nhập", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { user, token } = await authService.login(email, password);
    res.json({ user, token });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};
exports.logout = async (req, res) => {
  console.log("req:", req);
  try {
    const user = await authService.logout(req.user.id);
    res.json({ user });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};
