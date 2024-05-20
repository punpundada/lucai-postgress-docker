import { Router } from "express";
import { protectionCSRF, validateSessionCookies, } from "../middleware/authMiddleware";
import { signup,login, emailVerification, resetPassword } from "../controllers/userController";

export const userRoute = Router();

userRoute.post('/signup',signup)
userRoute.post('/login',login)
userRoute.post('/email-verification',validateSessionCookies,emailVerification)
userRoute.post('/reset-password',resetPassword)

