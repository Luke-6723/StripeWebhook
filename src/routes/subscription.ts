/**
 * /api/customer
 */
import express from "express";
import { kv } from "@/utils/kv";
import { stripe } from "@/utils/stripe";

const stripeCustomerRouter = express.Router();

stripeCustomerRouter.post("/api/customer/:customerId/updatePaymentDetails", async (req, res) => {
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

    if (!req.body?.return_url) {
      res.status(400).json({ error: "return_url not provided" });
      return;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId || customerId,
      return_url: req.body?.return_url
    });


    res.status(200).json({ url: session.url });
    return;
  }

  res.status(404).json({ error: "Not Found" });
  return;
});

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

    /**
     * We can check to make sure that the subscription key data
     * has cancelAtPeriodEnd set to false in the kv store to ensure
     * it was resumed successfully. otherwise we will wait 2 seconds.
     * This is a workaround for the fact that stripe
     * does not return the updated subscription data immediately.
     */
    let attempts = 0;
    while (true) {
      const updatedSubData = await kv.get(`stripe:customer:${stripeCustomerId}`);
      if (updatedSubData) {
        const parsedData = JSON.parse(updatedSubData);
        
        if (parsedData.cancelAtPeriodEnd === false || attempts >= 5) {
          break;
        }
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

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

    let attempts = 0;
    while (true) {
      const updatedSubData = await kv.get(`stripe:customer:${stripeCustomerId}`);
      if (updatedSubData) {
        const parsedData = JSON.parse(updatedSubData);
        
        if (parsedData.cancelAtPeriodEnd === true || attempts >= 5) {
          break;
        }
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }


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