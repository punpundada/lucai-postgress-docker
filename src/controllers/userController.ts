import type { Request, Response } from "express";
import { userZodSchema, type userInsert } from "../types/userTypes";
import { generateIdFromEntropySize } from "lucia";
import { hash, verify } from "@node-rs/argon2";
import { getHashedToken, hashOptions } from "../utils/utils";
import { db, lucia } from "..";
import { userSchema } from "../db/user";
import type { Res } from "../types/Response";
import { ZodError, z } from "zod";
import { eq } from "drizzle-orm";
import { transporter } from "../utils/transporter";
import { emailOtpHTML } from "../views/emailOPT";
import { generateEmailVerificationCode } from "../utils/generateEmailVerificationCode";
import { verifyVerificationCode } from "../utils/verifyVerificationCode";
import { emailVarificationSchema } from "../db/email-varification";
import { TimeSpan, createDate, isWithinExpirationDate } from "oslo";
import { createPasswordResetToken } from "../utils/createPasswordResetToken";
import { resetPasswordView } from "../views/reset-password";
import { PasswordType } from "../types/until-types";
import { resetTokenSchema } from "../db/reset-token";
import { sessionsSchema } from "../db/session";

export const signup = async (
  req: Request<unknown, unknown, userInsert>,
  res: Response<Res<any>>
) => {
  const userId = generateIdFromEntropySize(10); // 16 characters long
  try {
    //validating user body
    const validUser = userZodSchema.parse(req.body);
    validUser.id = userId;
    //hashing password
    const hashedPassword = await hash(validUser.password, hashOptions);
    validUser.password = hashedPassword;

    //saving user to db
    const savedUser = await db
      .insert(userSchema)
      .values(validUser as userInsert)
      .returning({ email: userSchema.email, name: userSchema.name, id: userSchema.id });

    //generating session cookie from lucia
    const session = await lucia.createSession(userId, { ip_country: "INDIA" });
    const sessionCookie = lucia.createSessionCookie(session.id);

    //generating validation code for email verification
    const verificationCode = await generateEmailVerificationCode(
      savedUser[0].id,
      savedUser[0].email
    );

    //saving code in email ver table
    await db.insert(emailVarificationSchema).values({
      code: verificationCode,
      email: savedUser[0].email,
      expiresAt: createDate(new TimeSpan(15, "m")),
      userId: savedUser[0].id,
    });

    //sending email to user for code
    const sendEmail = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      subject: "Varification OTP",
      to: savedUser[0].email,
      html: emailOtpHTML({
        name: "Auth Service",
        otp: verificationCode,
        validFor: "15 mins",
      }),
    });

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
      return res.status(400).json({
        isSuccess: false,
        message: error.message,
        issues: error.issues,
      });
    }

    // if(error?.code === '23505'){
    //   const user = await db.query.userSchema.findFirst({
    //     where:({email},{eq})=>eq(email,req.body.email)
    //   })
    //   console.log(user)
    //   if(!user){
    //     return res.status(400).json({
    //       isSuccess:false,
    //       issues:[],
    //       message:"Something went wrong"
    //     })
    //   }
    //   if(user.email_verified){
    //     return res.status(201).json({
    //       isSuccess: false,
    //       message: error.message,
    //       issues: [],
    //     });
    //   }else{
    //     console.log('inside else block')
    //     await db.transaction(async (tx)=>{
    //       await tx.delete(sessionsSchema).where(eq(sessionsSchema.userId,user.id))
    //       await tx.delete(emailVarificationSchema).where(eq(emailVarificationSchema.userId,user.id))
    //       await tx.delete(userSchema).where(eq(userSchema.id,user.id))
    //     })
    //     await signup(req,res)
    //   }
    // }

    return res.status(400).json({
      isSuccess: false,
      message: error.message,
      issues: [],
    });
  }
};

export const login = async (
  req: Request<unknown, unknown, { email: string; password: string }>,
  res: Response<Res<{ email: string; name: string; id: string; email_verified: boolean }>>
) => {
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
        email_verified: !!user.email_verified,
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

export const emailVerification = async (
  req: Request<unknown, unknown, { code: string }>,
  res: Response
) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(404).json({
        isSussess: false,
        message: "user not found",
      });
    }

    const parsedCode = z.string().parse(req.body.code);
    const isValidCode = await verifyVerificationCode(user, parsedCode);

    if (!isValidCode) {
      return res.status(400).json({
        isSussess: false,
        message: "unvalid code",
      });
    }
    await lucia.invalidateUserSessions(user.id);

    await db
      .update(userSchema)
      .set({
        email_verified: true,
      })
      .where(eq(userSchema.id, user.id));

    const session = await lucia.createSession(user.id, { ip_country: "INDIA" });
    const sessionCookie = lucia.createSessionCookie(session.id);

    res.set("Location", "/");
    res.set("Set-Cookie", sessionCookie.serialize());

    return res.status(200).json({
      isSuccess: true,
      message: "Email varidied successfully",
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

export const sendResetPasswordEmail = async (
  req: Request<unknown, unknown, { email: string }>,
  res: Response<Res<{ email: string }>>
) => {
  try {
    const validEmail = z.string().parse(req.body.email);
    const user = await db.query.userSchema.findFirst({
      where: ({ email }, { eq }) => eq(email, validEmail),
    });
    if (!user) {
      return res.status(404).json({
        isSuccess: false,
        issues: [],
        message: "User not found",
      });
    }
    const verificationToken = await createPasswordResetToken(user.id);
    const verificationLink = `${req.headers.origin}/reset-password/${verificationToken}`;
    // const verificationLink = `http://localhost:5173/reset-password/${verificationToken}`;

    const email = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      subject: "Password Reset Request",
      to: validEmail,
      html: resetPasswordView({ redirectURL: verificationLink }),
    });

    // if (email.rejected) {
    //   res.status(404);
    // }
    res.status(200).json({
      isSuccess: true,
      message: "Email send successfully",
      result: { email: validEmail },
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

export const verifyAndResetPassword = async (
  req: Request<{ token: string }, unknown, { password: string }>,
  res: Response<Res<string>>
) => {
  try {
    const validPassword = PasswordType.parse(req.body.password);
    const verificationToken = req.params.token;
    const hashedToken = await getHashedToken(verificationToken);

    const savedToken = await db.query.resetTokenSchema.findFirst({
      where: eq(resetTokenSchema.tokenHash, hashedToken),
    });

    if (!savedToken) {
      return res.status(400).json({
        isSuccess: false,
        issues: [],
        message: "Someting went wrong",
      });
    }
    if (!isWithinExpirationDate(savedToken.expiresAt)) {
      return res.status(400).json({
        isSuccess: false,
        issues: [],
        message: "Timeout",
      });
    }

    const deleteHash = db
      .delete(resetTokenSchema)
      .where(eq(resetTokenSchema.tokenHash, hashedToken));
    await lucia.invalidateUserSessions(savedToken.userId);

    const passwordHash = await hash(validPassword, hashOptions);

    await db
      .update(userSchema)
      .set({ password: passwordHash })
      .where(eq(userSchema.id, savedToken.userId));

    const session = await lucia.createSession(savedToken.userId, { ip_country: "INDIA" });

    const sessionCookie = lucia.createSessionCookie(session.id);
    await deleteHash;
    return res
      .status(302)
      .json({
        isSuccess: true,
        message: "Password reset successfully",
        result: "Success",
      })
      .header({
        Location: "/",
        "Set-Cookie": sessionCookie.serialize(),
        "Referrer-Policy": "no-referrer",
      });
  } catch (error: any) {
    console.log(error);
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

export const logout = async (req: Request, res: Response<Res<null>>) => {
  try {
    const sessionId = res.locals.session?.id;
    if (!sessionId || !res.locals.user?.id) {
      return res.status(400).json({
        isSuccess: false,
        issues: [],
        message: "Something went wrong",
      });
    }

    const deletetedSession = db
      .delete(sessionsSchema)
      .where(eq(sessionsSchema.id, sessionId));
    res.clearCookie("session_user");
    await deletetedSession;
    return res.status(200).json({
      isSuccess: true,
      message: "User logout successfully",
      result: null,
    });
  } catch (error: any) {
    console.log(error);
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

export const logoutFromAllDevices = async (req: Request, res: Response<Res<null>>) => {
  try {
    const sessionId = res.locals.session?.id;
    if (!sessionId || !res.locals.user?.id) {
      return res.status(400).json({
        isSuccess: false,
        issues: [],
        message: "Something went wrong",
      });
    }

    const deletetedSession = db
      .delete(sessionsSchema)
      .where(eq(sessionsSchema.userId, res.locals.user?.id));
    res.clearCookie("session_user");
    await deletetedSession;
    return res.status(200).json({
      isSuccess: true,
      message: "User logout from all devices successfully",
      result: null,
    });
  } catch (error: any) {
    console.log(error);
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
