import Stripe from 'stripe';

// Initialize Stripe with secret key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

export async function createCheckoutSession(params: {
  seatIds: string[];
  seatDetails: { id: string; section: string; row: string; number: number; price: number }[];
  successUrl: string;
  cancelUrl: string;
}) {
  const { seatIds, seatDetails, successUrl, cancelUrl } = params;

  // Create line items for each seat
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = seatDetails.map(seat => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: `Section ${seat.section}, Row ${seat.row}, Seat ${seat.number}`,
        description: 'Colorado Spartans 2026 Season Ticket',
      },
      unit_amount: seat.price,
    },
    quantity: 1,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      seatIds: JSON.stringify(seatIds),
    },
    // Enable additional payment methods
    payment_method_options: {
      card: {
        setup_future_usage: undefined,
      },
    },
  });

  return session;
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
) {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export async function getSession(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId);
}

export { stripe };
