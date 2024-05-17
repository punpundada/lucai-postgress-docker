import { Router } from "express";
import { protectionCSRF, validateSessionCookies } from "../middleware/authMiddleware";
import { signup,login } from "../controllers/userController";

export const userRoute = Router();

userRoute.post('/signup',protectionCSRF,signup)
userRoute.post('/login',validateSessionCookies,login)

