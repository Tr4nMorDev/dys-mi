const express = require("express");
const router = express.Router();
const { registerUser } = require("../controllers/user.controler");
const { verifyGoogleToken } = require("../middlewares/oauth.middleware");
const authController = require("../controllers/auth.controller");
router.get("/", (req, res) => {
  res.send("Welcome to Caro Game API!");
});

router.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

router.post("/api/signup", registerUser);
router.post(
  "/auth/google-login",
  verifyGoogleToken,
  authController.googleLogin
);
router.post("/api/login", authController.login);
// router.post("/api/logout", authController.logout);
// router.post("api/matchmaking/start");
module.exports = router;
