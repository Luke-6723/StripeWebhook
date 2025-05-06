/**
 * /api/customer
 */
import express from "express";
import { kv } from "@/utils/kv";
import { stripe } from "@/utils/stripe";

const stripeCustomerRouter = express.Router();

stripeCustomerRouter.get("/api/customer/:customerId/resume", async (req, res) => {
  const customerId = req.params.customerId;
  let stripeCustomerId;
  let subData;

  if (customerId) {
    subData = await kv.get(`stripe:customer:${customerId}`);

    if (subData?.startsWith("cus_")) {
      stripeCustomerId = subData;
      subData = await kv.get(`stripe:customer:${stripeCustomerId}`);

      try {
        subData = JSON.parse(subData || "");
      } catch {
        subData = null;
      }
    }
  }

  if (subData) {
    const resumeSub = await stripe.subscriptions.update(subData.subscriptionId, {
      cancel_at_period_end: false
    });


    res.status(200).json({
      success: true,
      response: resumeSub
    });
    return;
  }

  res.status(404).json({ error: "Not Found" });
  return;
});

stripeCustomerRouter.get("/api/customer/:customerId/cancel", async (req, res) => {
  const customerId = req.params.customerId;
  let stripeCustomerId;
  let subData;

  if (customerId) {
    subData = await kv.get(`stripe:customer:${customerId}`);

    if (subData?.startsWith("cus_")) {
      stripeCustomerId = subData;
      subData = await kv.get(`stripe:customer:${stripeCustomerId}`);

      try {
        subData = JSON.parse(subData || "");
      } catch {
        subData = null;
      }
    }
  }

  if (subData) {
    const cancelSub = await stripe.subscriptions.update(subData.subscriptionId, {
      cancel_at_period_end: true
    });


    res.status(200).json({
      success: true,
      response: cancelSub
    });
    return;
  }

  res.status(404).json({ error: "Not Found" });
  return;
});

stripeCustomerRouter.get("/api/customer/:customerId", async (req, res) => {
  const customerId = req.params.customerId;
  let stripeCustomerId;
  let subData;

  if (customerId) {
    subData = await kv.get(`stripe:customer:${customerId}`);

    if (subData?.startsWith("cus_")) {
      stripeCustomerId = subData;
      subData = await kv.get(`stripe:customer:${stripeCustomerId}`);
    }
  }

  if (subData) {
    res.status(200).json({
      data: {
        // If the provided a cus_ they know it already this is here for consistency
        customerId: stripeCustomerId || customerId,
        ...JSON.parse(subData)
      }
    });
    return;
  }

  res.status(404).json({ error: "Not Found" });
  return;
});

export default stripeCustomerRouter;