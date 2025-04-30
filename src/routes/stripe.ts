/**
 * /api/stripe
 */
import express, { Request } from "express";
import { processEvent } from "@/utils/processEvent";
import { stripe } from "@/utils/stripe";

const stripeWebhookRouter = express.Router();

stripeWebhookRouter.post("/api/stripe", async (req, res) => {
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    res.status(400).json({ error: "Bad Request" });
    return;
  }

  async function doEventProcessing() {
    if (typeof signature !== "string") {
      throw new Error("[STRIPE HOOK] Header isn't a string???");
    }

    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log(event);

    await processEvent(event);
  }

  await doEventProcessing().catch(error => {
    console.error("[STRIPE HOOK] Error processing event", error);
  });

  res.status(200).json({ status: "OK" });
  return;

});

export default stripeWebhookRouter;