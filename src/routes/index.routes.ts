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

router.post("/auth/signup", registerUser);
router.post("/auth/google", verifyGoogleToken, authController.googleLogin);
router.post("/auth/login", authController.login);

router.post("/auth/logout", verifyJwtToken, authController.logout);

export default router;
