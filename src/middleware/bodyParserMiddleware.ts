import express, { NextFunction, Request, Response } from "express";


export default function (req: Request, res: Response, next: NextFunction) {
  // Simple fix to stop /api/stripe being affected by JSON parsing.
  // Stripe NEEDS the raw body.
  if (req.originalUrl === "/api/stripe") {
    return express.raw({ type: "application/json" })(req, res, next);
  }

  return express.json()(req, res, next);
};