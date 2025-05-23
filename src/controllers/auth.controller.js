const jwt = require("jsonwebtoken");
const userService = require("../services/user.service");

exports.googleLogin = async (req, res) => {
  const { email, name, picture } = req.googleUser;

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

    res.status(200).json({ user, token });
  } catch (err) {
    console.error("Google login error:", err.message);
    res.status(500).json({ message: "Lỗi đăng nhập", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Email không tồn tại" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu" });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
