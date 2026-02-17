// GoHighLevel Integration Service

const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const GHL_BASE_URL = 'https://services.leadconnectorhq.com';

interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  tags?: string[];
  customFields?: Record<string, string>;
}

interface TicketPurchaseData {
  contactId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  ticketCount: number;
  totalAmount: number;
  seatNumbers: string[];
  section: string;
}

// Create or update a contact in GHL
export async function createOrUpdateContact(data: ContactData): Promise<string | null> {
  if (!GHL_API_KEY) {
    console.warn('GHL_API_KEY not set, skipping GHL integration');
    return null;
  }

  try {
    // First, try to find existing contact by email
    const searchRes = await fetch(
      `${GHL_BASE_URL}/contacts/search/duplicate?locationId=${GHL_LOCATION_ID}&email=${encodeURIComponent(data.email)}`,
      {
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Version': '2021-07-28'
        }
      }
    );

    let contactId: string | null = null;

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.contact?.id) {
        contactId = searchData.contact.id;
      }
    }

    const contactPayload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      locationId: GHL_LOCATION_ID,
      tags: data.tags || [],
      customFields: data.customFields ? Object.entries(data.customFields).map(([key, value]) => ({
        key,
        field_value: value
      })) : []
    };

    if (contactId) {
      // Update existing contact
      await fetch(`${GHL_BASE_URL}/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify(contactPayload)
      });
      console.log(`Updated GHL contact: ${contactId}`);
    } else {
      // Create new contact
      const createRes = await fetch(`${GHL_BASE_URL}/contacts/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify(contactPayload)
      });

      if (createRes.ok) {
        const createData = await createRes.json();
        contactId = createData.contact?.id;
        console.log(`Created GHL contact: ${contactId}`);
      }
    }

    return contactId;
  } catch (error) {
    console.error('GHL contact error:', error);
    return null;
  }
}

// Add tags to a contact
export async function addTagsToContact(contactId: string, tags: string[]): Promise<boolean> {
  if (!GHL_API_KEY || !contactId) return false;

  try {
    await fetch(`${GHL_BASE_URL}/contacts/${contactId}/tags`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify({ tags })
    });
    return true;
  } catch (error) {
    console.error('GHL add tags error:', error);
    return false;
  }
}

// Record a ticket purchase - creates/updates contact and adds purchase info
export async function recordTicketPurchase(data: TicketPurchaseData): Promise<string | null> {
  const tags = [
    'Ticket Buyer',
    'Spartans Tickets',
    `${data.ticketCount} Tickets`,
    data.section
  ];

  const customFields: Record<string, string> = {
    'tickets_purchased': data.ticketCount.toString(),
    'ticket_total': `$${data.totalAmount}`,
    'seat_numbers': data.seatNumbers.join(', '),
    'section': data.section,
    'purchase_date': new Date().toISOString()
  };

  const contactId = await createOrUpdateContact({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    tags,
    customFields
  });

  return contactId;
}

// Trigger a workflow/automation
export async function triggerWorkflow(contactId: string, workflowId: string): Promise<boolean> {
  if (!GHL_API_KEY || !contactId || !workflowId) return false;

  try {
    await fetch(`${GHL_BASE_URL}/contacts/${contactId}/workflow/${workflowId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      }
    });
    console.log(`Triggered workflow ${workflowId} for contact ${contactId}`);
    return true;
  } catch (error) {
    console.error('GHL workflow trigger error:', error);
    return false;
  }
}

// Send SMS via GHL
export async function sendSMS(contactId: string, message: string): Promise<boolean> {
  if (!GHL_API_KEY || !contactId) return false;

  try {
    await fetch(`${GHL_BASE_URL}/conversations/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify({
        type: 'SMS',
        contactId,
        message
      })
    });
    return true;
  } catch (error) {
    console.error('GHL SMS error:', error);
    return false;
  }
}

export default {
  createOrUpdateContact,
  addTagsToContact,
  recordTicketPurchase,
  triggerWorkflow,
  sendSMS
};
