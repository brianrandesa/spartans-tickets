import type { VercelRequest, VercelResponse } from '@vercel/node';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

// GHL API integration
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || 'UIgZIZySfnBryLV4WWIh';

const SINGLE_GA_PRICE = 3500;
const FAMILY_PACK_PRICE = 10000;
const PROCESSING_FEE = 499;

interface GameInfo {
  id: string;
  opponent: string;
  date: string;
  dateDisplay: string;
  time: string;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

function sanitizeQty(value: unknown): number {
  const qty = Number(value);
  if (!Number.isFinite(qty) || qty < 0) return 0;
  return Math.floor(qty);
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

  const { singleQty, familyQty, game, customer } = req.body as {
    singleQty: unknown;
    familyQty: unknown;
    game?: GameInfo;
    customer?: CustomerInfo;
  };

  const normalizedSingleQty = sanitizeQty(singleQty);
  const normalizedFamilyQty = sanitizeQty(familyQty);

  if (normalizedSingleQty + normalizedFamilyQty === 0) {
    return res.status(400).json({ error: 'Select at least one ticket option' });
  }

  if (!customer?.firstName || !customer?.lastName || !customer?.email) {
    return res.status(400).json({ error: 'Missing required customer fields' });
  }

  if (!game?.id || !game?.opponent || !game?.dateDisplay || !game?.time) {
    return res.status(400).json({ error: 'Missing game information' });
  }

  const totalAmount = (normalizedSingleQty * SINGLE_GA_PRICE) + (normalizedFamilyQty * FAMILY_PACK_PRICE) + PROCESSING_FEE;
  const totalTickets = normalizedSingleQty + (normalizedFamilyQty * 4);

  try {
    const lineItemsParams = new URLSearchParams();
    lineItemsParams.set('mode', 'payment');
    lineItemsParams.set('success_url', 'https://spartans-tickets.vercel.app/success?session_id={CHECKOUT_SESSION_ID}');
    lineItemsParams.set('cancel_url', 'https://spartans-tickets.vercel.app/ga');
    lineItemsParams.set('customer_email', customer.email);

    let lineItemIndex = 0;

    if (normalizedSingleQty > 0) {
      lineItemsParams.set(`line_items[${lineItemIndex}][price_data][currency]`, 'usd');
      lineItemsParams.set(`line_items[${lineItemIndex}][price_data][product_data][name]`, 'General Admission Ticket');
      lineItemsParams.set(`line_items[${lineItemIndex}][price_data][product_data][description]`, `${game.dateDisplay} at ${game.time} • Colorado Spartans vs ${game.opponent}`);
      lineItemsParams.set(`line_items[${lineItemIndex}][price_data][unit_amount]`, SINGLE_GA_PRICE.toString());
      lineItemsParams.set(`line_items[${lineItemIndex}][quantity]`, normalizedSingleQty.toString());
      lineItemIndex++;
    }

    if (normalizedFamilyQty > 0) {
      lineItemsParams.set(`line_items[${lineItemIndex}][price_data][currency]`, 'usd');
      lineItemsParams.set(`line_items[${lineItemIndex}][price_data][product_data][name]`, 'General Admission Family 4-Pack');
      lineItemsParams.set(`line_items[${lineItemIndex}][price_data][product_data][description]`, `${game.dateDisplay} at ${game.time} • Colorado Spartans vs ${game.opponent}`);
      lineItemsParams.set(`line_items[${lineItemIndex}][price_data][unit_amount]`, FAMILY_PACK_PRICE.toString());
      lineItemsParams.set(`line_items[${lineItemIndex}][quantity]`, normalizedFamilyQty.toString());
      lineItemIndex++;
    }

    lineItemsParams.set(`line_items[${lineItemIndex}][price_data][currency]`, 'usd');
    lineItemsParams.set(`line_items[${lineItemIndex}][price_data][product_data][name]`, 'Processing Fee');
    lineItemsParams.set(`line_items[${lineItemIndex}][price_data][unit_amount]`, PROCESSING_FEE.toString());
    lineItemsParams.set(`line_items[${lineItemIndex}][quantity]`, '1');

    lineItemsParams.set('metadata[purchase_type]', 'general_admission');
    lineItemsParams.set('metadata[game_id]', game.id);
    lineItemsParams.set('metadata[game_opponent]', game.opponent);
    lineItemsParams.set('metadata[customer_name]', `${customer.firstName} ${customer.lastName}`.trim());
    lineItemsParams.set('metadata[customer_phone]', customer.phone || '');
    lineItemsParams.set('metadata[single_qty]', normalizedSingleQty.toString());
    lineItemsParams.set('metadata[family_pack_qty]', normalizedFamilyQty.toString());
    lineItemsParams.set('metadata[total_tickets]', totalTickets.toString());
    lineItemsParams.set('metadata[total_amount]', totalAmount.toString());

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

    if (GHL_API_KEY) {
      try {
        const tags = [
          'Ticket Buyer',
          'Spartans Tickets',
          'General Admission',
          `${totalTickets} GA Tickets`,
          game.opponent,
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
            'Version': '2021-07-28',
          },
          body: JSON.stringify(contactPayload),
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
    console.error('GA checkout error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
