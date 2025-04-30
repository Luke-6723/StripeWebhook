import { NextFunction, Request, Response } from "express";

export default function (req: Request, res: Response, next: NextFunction) {
  // Dont need to do this for stripe.
  // We validate the signature.
  if (req.originalUrl === "/api/stripe") {
    return next();
  }

  if (process.env.REQUIRE_AUTH_HEADER === "true") {
    if (req.headers.authorization !== process.env.API_AUTH_HEADER) {
      res.status(403).json({
        error: "Unauthorized"
      });
    } else {
      return next();
    }
  } else {
    return next();
  }
}