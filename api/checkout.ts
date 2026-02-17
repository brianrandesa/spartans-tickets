import type { VercelRequest, VercelResponse } from '@vercel/node';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

// GHL API integration
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || 'UIgZIZySfnBryLV4WWIh';

// Valid coupon codes (discount in cents per ticket)
const COUPONS: Record<string, number> = {
  'LOCAL455': 1000 // $10 off per ticket
};

// Processing fee in cents
const PROCESSING_FEE = 499; // $4.99

interface CheckoutItem {
  seatId: string;
  section: string;
  row: string;
  seatNumber: number;
  price: number;
  game: {
    id: string;
    opponent: string;
    date: string;
    dateDisplay: string;
    time: string;
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { items, customer, couponCode } = req.body as { items: CheckoutItem[]; customer: any; couponCode?: string };

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No seats selected' });
  }

  // Validate and apply coupon
  const couponDiscount = couponCode && COUPONS[couponCode.toUpperCase()] ? COUPONS[couponCode.toUpperCase()] : 0;

  // Group items by game for line items
  const itemsByGame: Record<string, CheckoutItem[]> = {};
  items.forEach(item => {
    if (!itemsByGame[item.game.id]) {
      itemsByGame[item.game.id] = [];
    }
    itemsByGame[item.game.id].push(item);
  });

  const totalAmount = items.reduce((sum, item) => sum + item.price, 0) - (couponDiscount * items.length);

  try {
    // Build line items for Stripe - one per game
    const lineItemsParams = new URLSearchParams();
    lineItemsParams.set('mode', 'payment');
    lineItemsParams.set('success_url', `https://spartans-tickets.vercel.app/success?session_id={CHECKOUT_SESSION_ID}`);
    lineItemsParams.set('cancel_url', 'https://spartans-tickets.vercel.app');
    lineItemsParams.set('customer_email', customer?.email || '');

    let lineItemIndex = 0;
    Object.entries(itemsByGame).forEach(([gameId, gameItems]) => {
      const game = gameItems[0].game;
      const gameTotal = gameItems.reduce((sum, item) => sum + item.price, 0) - (couponDiscount * gameItems.length);
      const seatList = gameItems.map(item => `${item.section}-${item.row}-${item.seatNumber}`).slice(0, 5);
      const seatDisplay = seatList.join(', ') + (gameItems.length > 5 ? '...' : '');

      lineItemsParams.set(`line_items[${lineItemIndex}][price_data][currency]`, 'usd');
      lineItemsParams.set(`line_items[${lineItemIndex}][price_data][product_data][name]`, `Spartans vs ${game.opponent}`);
      lineItemsParams.set(`line_items[${lineItemIndex}][price_data][product_data][description]`, `${game.dateDisplay} at ${game.time} • ${gameItems.length} ticket(s): ${seatDisplay}`);
      lineItemsParams.set(`line_items[${lineItemIndex}][price_data][unit_amount]`, gameTotal.toString());
      lineItemsParams.set(`line_items[${lineItemIndex}][quantity]`, '1');
      lineItemIndex++;
    });

    // Add processing fee as a line item
    lineItemsParams.set(`line_items[${lineItemIndex}][price_data][currency]`, 'usd');
    lineItemsParams.set(`line_items[${lineItemIndex}][price_data][product_data][name]`, 'Processing Fee');
    lineItemsParams.set(`line_items[${lineItemIndex}][price_data][unit_amount]`, PROCESSING_FEE.toString());
    lineItemsParams.set(`line_items[${lineItemIndex}][quantity]`, '1');

    // Add metadata
    lineItemsParams.set('metadata[customer_name]', `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim());
    lineItemsParams.set('metadata[customer_phone]', customer?.phone || '');
    lineItemsParams.set('metadata[total_tickets]', items.length.toString());
    lineItemsParams.set('metadata[games]', Object.keys(itemsByGame).length.toString());
    if (couponCode) {
      lineItemsParams.set('metadata[coupon_code]', couponCode.toUpperCase());
    }

    // Create Stripe checkout session
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: lineItemsParams.toString(),
    });

    const session = await stripeResponse.json();

    if (session.error) {
      console.error('Stripe error:', session.error);
      return res.status(400).json({ error: session.error.message });
    }

    // Create/update contact in GHL
    if (GHL_API_KEY && customer) {
      try {
        const gameNames = [...new Set(items.map(item => item.game.opponent))];
        const tags = [
          'Ticket Buyer',
          'Spartans Tickets',
          `${items.length} Tickets`,
          ...gameNames
        ];

        const contactPayload = {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          locationId: GHL_LOCATION_ID,
          tags,
        };

        await fetch('https://services.leadconnectorhq.com/contacts/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GHL_API_KEY}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28'
          },
          body: JSON.stringify(contactPayload)
        });
      } catch (error) {
        console.error('GHL error:', error);
      }
    }

    return res.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
