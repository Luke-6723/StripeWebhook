import express, { NextFunction, Request, Response } from "express";
import checkoutRouter from "./routes/checkout";

export const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());
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

app.use(checkoutRouter);

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});