import express, { NextFunction, Request, Response } from "express";
import checkoutRouter from "./routes/checkout";
import stripeWebhookRouter from "./routes/stripe";
import stripeCustomerRouter from "./routes/subscription";
import bodyParserMiddleware from "./middleware/bodyParserMiddleware";
import authenticationMiddleware from "./middleware/authenticationMiddleware";
import errorHandlerMiddleware from "./middleware/errorHandlerMiddleware";

export const app = express();
// Middleware to parse JSON
app.use(bodyParserMiddleware);

// Middleware to authenticate requests
app.use(authenticationMiddleware);

// Make the JSON responses pretty (not necessary by meh)
app.set("json spaces", 2);

app.use(errorHandlerMiddleware);

app.use(stripeWebhookRouter);
app.use(checkoutRouter);
app.use(stripeCustomerRouter);

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});