const userService = require("../services/user.service");

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Email không hợp lệ" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Mật khẩu quá yếu (>= 6 ký tự)" });
  }
  try {
    const user = await userService.registerUser({ name, email, password });
    res.status(201).json(user);
  } catch (err) {
    if (err.message === "EMAIL_EXISTS") {
      return res.status(409).json({ message: "Email đã tồn tại" });
    }

    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
