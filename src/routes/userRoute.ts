import { Router } from "express";
import { validateSessionCookies } from "../middleware/authMiddleware";
import {
  signup,
  login,
  emailVerification,
  sendResetPasswordEmail,
  verifyAndResetPassword,
  logout,
  logoutFromAllDevices,
} from "../controllers/userController";

export const userRoute = Router();

userRoute.post("/signup", signup);
userRoute.post("/login", login);
userRoute.get("/logout", validateSessionCookies, logout);
userRoute.get("/logout/all", validateSessionCookies, logoutFromAllDevices);
userRoute.post("/email-verification", validateSessionCookies, emailVerification);
userRoute.post("/reset-password", sendResetPasswordEmail);
userRoute.post("/reset-password/:token", verifyAndResetPassword);
