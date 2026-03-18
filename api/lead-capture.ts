import type { VercelRequest, VercelResponse } from '@vercel/node';

const LEAD_GHL_API_KEY = process.env.LEAD_GHL_API_KEY || '';
const LEAD_GHL_LOCATION_ID = process.env.LEAD_GHL_LOCATION_ID || '';
const LEAD_GHL_WORKFLOW_ID = process.env.LEAD_GHL_WORKFLOW_ID || '';
const LEAD_GHL_TAGS = (process.env.LEAD_GHL_TAGS || 'Lead,Spartans Tickets,Homepage Popup')
  .split(',')
  .map((tag) => tag.trim())
  .filter(Boolean);

const GHL_BASE_URL = 'https://services.leadconnectorhq.com';

interface LeadPayload {
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  const [first, ...rest] = trimmed.split(/\s+/);
  return {
    firstName: first || trimmed || 'Ticket',
    lastName: rest.join(' ') || '-',
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

  if (!LEAD_GHL_API_KEY || !LEAD_GHL_LOCATION_ID) {
    return res.status(500).json({ error: 'Lead GHL integration is not configured' });
  }

  const { name, email, phone, source } = (req.body || {}) as LeadPayload;
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Missing required lead fields' });
  }

  const { firstName, lastName } = splitName(name);
  const tags = [...LEAD_GHL_TAGS];
  if (source) tags.push(source);

  try {
    const searchUrl =
      `${GHL_BASE_URL}/contacts/search/duplicate` +
      `?locationId=${encodeURIComponent(LEAD_GHL_LOCATION_ID)}` +
      `&email=${encodeURIComponent(email)}` +
      `&phone=${encodeURIComponent(phone)}`;

    const searchRes = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${LEAD_GHL_API_KEY}`,
        Version: '2021-07-28',
      },
    });

    let contactId = '';
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      contactId = searchData?.contact?.id || '';
    }

    const contactPayload = {
      firstName,
      lastName,
      email,
      phone,
      locationId: LEAD_GHL_LOCATION_ID,
      tags,
    };

    if (contactId) {
      await fetch(`${GHL_BASE_URL}/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${LEAD_GHL_API_KEY}`,
          'Content-Type': 'application/json',
          Version: '2021-07-28',
        },
        body: JSON.stringify(contactPayload),
      });
    } else {
      const createRes = await fetch(`${GHL_BASE_URL}/contacts/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${LEAD_GHL_API_KEY}`,
          'Content-Type': 'application/json',
          Version: '2021-07-28',
        },
        body: JSON.stringify(contactPayload),
      });

      if (createRes.ok) {
        const createData = await createRes.json();
        contactId = createData?.contact?.id || '';
      }
    }

    if (LEAD_GHL_WORKFLOW_ID && contactId) {
      await fetch(`${GHL_BASE_URL}/contacts/${contactId}/workflow/${LEAD_GHL_WORKFLOW_ID}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${LEAD_GHL_API_KEY}`,
          'Content-Type': 'application/json',
          Version: '2021-07-28',
        },
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Lead capture error:', error);
    return res.status(500).json({ error: 'Failed to capture lead' });
  }
}
