import { expect, test, describe, beforeEach, afterEach,jest } from "bun:test";
import { validateSessionCookies } from "../middleware/authMiddleware";
import type { Request,Response,NextFunction } from "express";

describe("Auth Middleware", () => {
  let req:Request = {} as any;
  let res:Response = {} as any;
  let next:NextFunction = null as any;
  beforeEach(() => {
    // req = {
    //   headers: {
    //     cookie: "session_user=hkjrk5qrzp6hzsnglkbyvpiak2knvey4m37qgz6a", // Set the cookie header as needed for each test case
    //   },
    // };

    req = {
        headers:{
            cookie:'session_user=hkjrk5qrzp6hzsnglkbyvpiak2knvey4m37qgz6a'
        }
    } as any

    res={
        locals: {
            user:null,
            session:null
        },
        appendHeader: jest.fn()
    } as any
    next = jest.fn()
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  test("should be true", () => {
    expect(true).toBe(true);
  });

  test('if cookies are not provide user and session objects in res.locals should be null', async ()=>{
    // req.headers.cookie=null
    await validateSessionCookies(req,res,next)
    expect(res.locals.user).toBeNull()
    expect(res.locals.session).toBeNull()
    expect(next).toHaveBeenCalled()
  })

});
