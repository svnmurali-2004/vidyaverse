import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "./env";

let razorpayInstance = null;

export function getRazorpayInstance() {
  console.log("Razorpay env check:", {
    RAZORPAY_KEY_ID: env.RAZORPAY_KEY_ID,
    RAZORPAY_SECRET: env.RAZORPAY_SECRET ? "***hidden***" : undefined,
  });

  if (!razorpayInstance && env.RAZORPAY_KEY_ID && env.RAZORPAY_SECRET) {
    razorpayInstance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_SECRET,
    });
  }
  return razorpayInstance;
}

export async function createRazorpayOrder({
  amount,
  currency = "INR",
  receipt,
}) {
  const instance = getRazorpayInstance();

  if (!instance) {
    throw new Error(
      "Razorpay not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_SECRET"
    );
  }

  try {
    console.log("Creating Razorpay order with:", { amount, currency, receipt });

    const order = await instance.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt,
    });

    console.log("Razorpay order created successfully:", order.id);
    return order;
  } catch (error) {
    console.error("Error creating Razorpay order:", error);

    if (error.statusCode === 401) {
      throw new Error(
        "Razorpay authentication failed. Please check your API credentials."
      );
    }

    throw new Error(
      "Failed to create payment order: " + error.description || error.message
    );
  }
}

export async function verifyRazorpayPayment({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) {
  const instance = getRazorpayInstance();

  if (!instance) {
    throw new Error("Razorpay not configured");
  }

  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Fetch payment details from Razorpay
      const payment = await instance.payments.fetch(razorpay_payment_id);
      return { isValid: true, payment };
    }

    return { isValid: false, payment: null };
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    return { isValid: false, payment: null };
  }
}

export function getRazorpayConfig() {
  return {
    key_id: env.RAZORPAY_KEY_ID,
    // Note: Never expose key_secret to client
  };
}
