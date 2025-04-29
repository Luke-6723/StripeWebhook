import express, { Request } from "express";
import Stripe from "stripe";
import Redis from "ioredis";

interface CustomRequest extends Request {
  customer?: Stripe.Customer | Stripe.DeletedCustomer;
  stripeLineItems?: Stripe.Checkout.SessionCreateParams.LineItem[];
}

const kv = new Redis({
  host: process.env.KEYDB_HOST,
  port: Number(process.env.KEYDB_PORT) || 6379,
  db: 0
});

kv.on("connect", () => console.log("[KV] Connected"));

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
checkoutRouter.use(async (req: CustomRequest, res, next) => {
  const { email, lineItems, userId } = req.body;

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
    req.customer = await stripe.customers.retrieve(customerId);
  }

  if (!req.customer || req.customer.deleted) {
    req.customer = await stripe.customers.create({ email, metadata: { userId } });
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

  next();
});

checkoutRouter.post("/api/checkout", async (req: CustomRequest, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: req.customer?.id,
      line_items: req.stripeLineItems,
      success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.STRIPE_CANCEL_URL,
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