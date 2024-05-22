import type { Request, Response } from "express";
import {
  serviceZodSchema,
  type serviceInsert,
  type serviceSelect,
} from "../types/service-types";
import { db } from "..";
import { serviceSchema } from "../db/service";
import type { Res } from "../types/Response";
import { ZodError } from "zod";

export const addService = async (
  req: Request<unknown, unknown, serviceInsert>,
  res: Response<Res<serviceSelect[]>>
) => {
  try {
    const validServices = serviceZodSchema.parse(req.body);
    validServices.isActive = true;
    const savedService = await db.insert(serviceSchema).values(validServices).returning();
    
    res.status(201).json({
      isSuccess: true,
      message: "Service saved successfully",
      result: savedService,
    });

  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(201).json({
        isSuccess: false,
        message: error.message,
        issues: error.issues,
      });
    }
    return res.status(201).json({
      isSuccess: false,
      message: error.message,
      issues: [],
    });
  }
};
