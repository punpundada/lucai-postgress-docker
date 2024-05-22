import { Router } from "express";
import { addService } from "../controllers/serviceControllers";

export const serviceRoute = Router()

serviceRoute.post('/add',addService)
