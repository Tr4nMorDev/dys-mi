import express, { Request, Response } from "express";
import { registerUser } from "../controllers/user.controller";
import { verifyGoogleToken } from "../middlewares/oauth.middleware";
import authController from "../controllers/auth.controller";
import { verifyJwtToken } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Caro Game API!");
});

router.get("/favicon.ico", (req: Request, res: Response) => {
  res.status(204).end();
});

router.post("/api/signup", registerUser);
router.post(
  "/auth/google-login",
  verifyGoogleToken,
  authController.googleLogin
);
router.post("/api/login", authController.login);

router.post("/api/logout", verifyJwtToken, authController.logout);
// router.put(
//   "/api/matchmaking/start",
//   verifyJwtToken,
//   matchmaking.startMatchmaking
// );

export default router;
