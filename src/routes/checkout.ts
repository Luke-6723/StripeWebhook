import express, { Request } from "express";
import Stripe from "stripe";
import { kv } from "@/utils/kv";

interface CustomRequest extends Request {
  customer?: Stripe.Customer | Stripe.DeletedCustomer;
  stripeLineItems?: Stripe.Checkout.SessionCreateParams.LineItem[];
}

/**
 * /api/checkout
 */
const checkoutRouter = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET || "", { apiVersion: "2025-03-31.basil" });

/**
 * Wanting to keep it clean I'm using a middleware
router.use(async (req: CustomRequest, res, next) => {
 * this should ensure no matter what that
 * a checkout url is created reliably
 */

checkoutRouter.post("/api/checkout", async (req: CustomRequest, res) => {
  const { 
    email, 
    lineItems, 
    userId,
    cancelRedirect,
    successRedirect
  } = req.body;

  if (!successRedirect || !cancelRedirect) {
    res.status(400).json({ error: "successRedirect and cancelRedirect is required" });
    return;
  } 

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  if (!userId) {
    res.status(400).json({ error: "userId is required" });
    return;
  }

  if (!Array.isArray(lineItems) || lineItems.length < 1) {
    res.status(400).json({ error: "Please provide lineItems for the checkout" });
    return;
  }

  const customerId = await kv.get(`stripe:customer:${userId}`);

  if (customerId) {
    try {
      req.customer = await stripe.customers.retrieve(customerId).catch();
    } catch {
      req.customer = undefined;
    }
  }

  if (!req.customer || req.customer.deleted) {
    req.customer = await stripe.customers.create({ email, metadata: { userId } }, { idempotencyKey: `${userId}-${Date.now()}` });
    await kv.set(`stripe:customer:${userId}`, req.customer.id);
  }

  if (!req.customer) {
    res.status(500).json({ error: "Customer does not exist and could not be created." });
    return;
  }

  for (const item of lineItems) {
    const price = await stripe.prices.list({
      product: item.id,
      active: true,
      limit: 1
    }).catch((e) => {
      console.log(e);
      return undefined;
    });

    if (!req.stripeLineItems) req.stripeLineItems = [];

    if (price) {
      req.stripeLineItems.push({
        price: price.data[0].id,
        quantity: item.quantity || 1
      });
    }
  };

  if ((req.stripeLineItems || []).length < 1) {
    res.status(400).json({ error: "Line items could not be fetched" });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: req.customer?.id,
      line_items: req.stripeLineItems,
      success_url: `${successRedirect}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelRedirect,
    });

    res.json({ url: session.url });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
});

export default checkoutRouter;