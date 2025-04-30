import { NextFunction, Response, Request } from "express";

export default function (err: Error, _: Request, res: Response, next: NextFunction) {
  if (err instanceof SyntaxError) {
    res.status(400).send({ error: "Invalid JSON" });
  } else {
    next();
  }
}