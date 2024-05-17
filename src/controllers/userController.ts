import type { Request, Response } from "express";
import { userZodSchema, type userInsert } from "../types/userTypes";
import { generateIdFromEntropySize } from "lucia";
import { hash, verify } from "@node-rs/argon2";
import { hashOptions } from "../utils";
import { db, lucia } from "..";
import { userSchema } from "../db/user";
import type { Res } from "../types/Response";
import { ZodError, z } from "zod";
import { eq } from "drizzle-orm";

export const signup = async (
  req: Request<unknown, unknown, userInsert>,
  res: Response<Res<any>>
) => {
  console.log("req.body", req.body);
  const userId = generateIdFromEntropySize(10); // 16 characters long
  try {
    const validUser = userZodSchema.parse(req.body);
    validUser.id = userId;
    const hashedPassword = await hash(validUser.password, hashOptions);
    validUser.password = hashedPassword;
    console.log(validUser);

    const savedUser = await db
      .insert(userSchema)
      .values(validUser as userInsert)
      .returning({ email: userSchema.email, name: userSchema.name, id: userSchema.id });

    const session = await lucia.createSession(userId, { ip_country: "INDIA" });
    const sessionCookie = lucia.createSessionCookie(session.id);

    //setHeaders
    res.set("Location", "/");
    res.set("Set-Cookie", sessionCookie.serialize());

    return res.status(201).json({
      isSuccess: true,
      message: "User registred successfully",
      result: savedUser,
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

export const login = async (
  req: Request<unknown, unknown, { email: string; password: string }>,
  res: Response<Res<{ email: string; name: string; id: string }>>
) => {
  console.log("LOGIN");
  try {
    const validEmail = z.string().parse(req.body.email);
    const validPassword = z.string().parse(req.body.password);

    const user = await db.query.userSchema.findFirst({
      where: eq(userSchema.email, validEmail),
    });

    if (!user) {
      return res.status(404).json({
        isSuccess: false,
        issues: [],
        message: "Invalid email or password",
      });
    }
    const isValidPassword = await verify(user.password, validPassword, hashOptions);

    if (!isValidPassword) {
      return res.status(404).json({
        isSuccess: false,
        issues: [],
        message: "Invalid email or password",
      });
    }

    const session = await lucia.createSession(user.id, { ip_country: "INDIA" });
    const sessionCookie = lucia.createSessionCookie(session.id);

    res.set("Location", "/");
    res.set("Set-Cookie", sessionCookie.serialize());

    return res.status(200).json({
      isSuccess: true,
      message: "User login success",
      result: {
        email: user.email,
        id: user.id,
        name: user.name,
      },
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res.status(201).json({
        isSuccess: false,
        message: err.message,
        issues: err.issues,
      });
    }

    return res.status(201).json({
      isSuccess: false,
      message: err.message,
      issues: [],
    });
  }
};
