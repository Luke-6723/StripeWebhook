import express, { NextFunction, Request, Response } from "express";
import checkoutRouter from "./routes/checkout";
import stripeWebhookRouter from "./routes/stripe";

export const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use((req, res, next) => {
  // Simple fix to stop /api/stripe being affected by JSON parsing.
  // Stripe NEEDS the raw body.
  if (req.originalUrl === "/api/stripe") {
    return express.raw({ type: "application/json" })(req, res, next);
  }

  return express.json()(req, res, next);
});
// Make the JSON responses pretty (not necessary by meh)
app.set("json spaces", 2);

app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError) {
    res.status(400).send({ error: "Invalid JSON" });
  } else {
    next();
  }
});

// Basic route
app.get("/", (req, res) => {
  res.json({
    hello: "world",
  });
});

app.use(stripeWebhookRouter);
app.use(checkoutRouter);

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});