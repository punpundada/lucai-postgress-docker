import { Router } from "express";
import { protectionCSRF, validateSessionCookies } from "../middleware/authMiddleware";
import { signup,login, emailVerification } from "../controllers/userController";

export const userRoute = Router();

userRoute.post('/signup',protectionCSRF,signup)
userRoute.post('/login',protectionCSRF,validateSessionCookies,login)
userRoute.post('/email-verification',protectionCSRF,validateSessionCookies,emailVerification)

