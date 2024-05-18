import type { NextFunction, Request, Response } from "express";
import type { Session, User } from "lucia";
import { verifyRequestOrigin } from "lucia";
import { lucia } from "..";

export const protectionCSRF = (req: Request, res: Response, next: NextFunction) => {
  if(process.env.env === 'DEV'){
    return next();
  }
  if (req.method === "GET") {
    return next();
  }
  const originHeader = req.headers.origin ?? null;
  // NOTE: You may need to use `X-Forwarded-Host` instead
  const hostHeader = req.headers.host ?? null;

  if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader,`localhost:${process.env.PORT}`])) {
    console.log('HELLO');
    return res.status(403).end();
  }
};

export const validateSessionCookies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sessionId = lucia.readSessionCookie(req.headers.cookie ?? "");
  // const authorizationHeader = req?.headers?.get("Authorization");
  // const ss = lucia.readBearerToken(req?.headers?.get('') ?? '')
  if (!sessionId) {
    res.locals.user = null;
    res.locals.session = null;
    return next();
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (session && session.fresh) {
    res.appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize());
  }
  if (!session) {
    res.appendHeader("Set-Cookie", lucia.createBlankSessionCookie().serialize());
  }
  res.locals.user = user;
  res.locals.session = session;
  return next();
};


declare global {
	namespace Express {
		interface Locals {
			user: User | null;
			session: Session | null;
		}
	}
}