import { kv } from "./kv";
import { stripe } from "./stripe";

// The contents of this function should probably be wrapped in a try/catch
export async function syncStripeDataToKV(customerId: string) {
  // Fetch latest subscription data from Stripe
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 1,
    status: "all",
    expand: ["data.default_payment_method"],
  });

  if (subscriptions.data.length === 0) {
    const subData = { status: "none" };
    await kv.set(`stripe:customer:${customerId}`, JSON.stringify(subData));
    return subData;
  }

  // If a user can have multiple subscriptions, that's your problem
  const subscription = subscriptions.data[0];

  // Store complete subscription state
  const subData = {
    subscriptionId: subscription.id,
    status: subscription.status,
    prodId: subscription.items.data[0].price.product,
    priceId: subscription.items.data[0].price.id,
    currentPeriodEnd: subscription?.items.data[0].current_period_end,
    currentPeriodStart: subscription?.items.data[0].current_period_start,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    paymentMethod:
      subscription.default_payment_method &&
        typeof subscription.default_payment_method !== "string"
        ? {
          brand: subscription.default_payment_method.card?.brand ?? null,
          last4: subscription.default_payment_method.card?.last4 ?? null,
          expMonth: subscription.default_payment_method.card?.exp_month ?? null,
          expYear: subscription.default_payment_method.card?.exp_year ?? null,
        }
        : null,
  };

  // Store the data in your KV
  await kv.set(`stripe:customer:${customerId}`, JSON.stringify(subData));
  return subData;
}
