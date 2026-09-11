// TODO: Replace MACHINE_CATALOG with a real API call.
// See the TODO block below the handler for endpoint details.
const MACHINE_CATALOG = [
  { name: 'House Blend - Dark Roast', description: 'A bold blend of Arabica and Robusta beans with notes of dark chocolate, toasted nuts, and a hint of smokiness.', image_url: 'https://delivery-p158081-e1683323.adobeaemcloud.com/adobe/assets/urn:aaid:aem:3c43c4b2-5e63-42ca-a80b-e63d134a1cbe/as/FRES-COF-001.webp?quality=80&width=960&height=1191', price: '$14.99', category: 'Bagged Coffee' },
  { name: 'House Blend - Expresso', description: 'A rich, full-bodied coffee with notes of dark chocolate, caramel, and nuttiness.', image_url: 'https://delivery-p158081-e1683323.adobeaemcloud.com/adobe/assets/urn:aaid:aem:3df2b232-b4f1-4d4e-ac8e-2b76c28fb00e/as/FRES-COF-002.webp?quality=80&width=960&height=1191', price: '$14.99', category: 'Coffee Pods' },
  { name: 'House Blend - Medium Roast', description: 'A smooth blend with bold notes of caramel, toasted nuts, and fruitiness for a flavorful, aromatic cup.', image_url: 'https://delivery-p158081-e1683323.adobeaemcloud.com/adobe/assets/urn:aaid:aem:19414faa-96e6-489d-9c62-5f3c3bc708d7/as/FRES-COF-003.webp?quality=80&width=960&height=1191', price: '$14.99', category: 'Bagged Coffee' },
  { name: 'Morning Muse - Light Roast', description: 'A Colombian roast with caramel, chocolate, and cherry flavor.', image_url: 'https://delivery-p158081-e1683323.adobeaemcloud.com/adobe/assets/urn:aaid:aem:e4be36fc-dc7c-4374-9505-a89b3c59271b/as/FRES-COF-004.webp?quality=80&width=960&height=1191', price: '$3.99', category: 'Bagged Coffee' },
  { name: 'Fresco Deluxe', description: 'Triple-nozzle machine with timed brewing, adjustable grind coarseness, and custom drink settings.', image_url: 'https://delivery-p158081-e1683323.adobeaemcloud.com/adobe/assets/urn:aaid:aem:37d0c924-9f9e-4622-a4ba-121a2b7d5fff/as/FRES-MAC-002.webp?quality=80&width=960&height=1191', price: '$499.00', category: 'Coffee Machines' },
  { name: 'Frescopa Maestro 300', description: 'Fully automatic bean-to-cup machine with a built-in grinder and automatic milk system.', image_url: 'https://delivery-p158081-e1683323.adobeaemcloud.com/adobe/assets/urn:aaid:aem:1fd8810d-d13a-49fd-af60-a8df5ee209e3/as/FRES-MAC-005.webp?quality=80&width=960&height=1191', price: '$1,099.00', category: 'Coffee Machines' },
];

function resolveMachine({ product_id, product_name }) {
  if (product_id && typeof product_id === 'string') {
    const byId = MACHINE_CATALOG.find((m) => m.name === product_id.trim());
    if (byId) return byId;
  }
  if (product_name && typeof product_name === 'string') {
    const q = product_name.trim().toLowerCase();
    return MACHINE_CATALOG.find((m) => m.name.toLowerCase() === q)
      || MACHINE_CATALOG.find((m) => m.name.toLowerCase().includes(q))
      || null;
  }
  return null;
}

module.exports = async ({
  product_id = '',
  product_name = '',
  intended_use = '',
  customer_name = '',
  email = '',
  phone = '',
  message = '',
} = {}) => {
  const missing = [];
  if (!intended_use || typeof intended_use !== 'string' || !intended_use.trim()) missing.push('intended_use');
  if (!customer_name || typeof customer_name !== 'string' || !customer_name.trim()) missing.push('customer_name');
  if (!email || typeof email !== 'string' || !email.trim()) missing.push('email');

  if (missing.length > 0) {
    return {
      content: [{ type: 'text', text: `Please provide ${missing.join(', ')} to submit the enquiry.` }],
      structuredContent: {
        confirmation_id: null,
        status: null,
        message: null,
        product_id: null,
        product_name: null,
        submitted_at: null,
      },
    };
  }

  const trimmedEmail = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return {
      content: [{ type: 'text', text: 'Please provide a valid email address so the team can follow up.' }],
      structuredContent: {
        confirmation_id: null,
        status: null,
        message: null,
        product_id: null,
        product_name: null,
        submitted_at: null,
      },
    };
  }

  const machine = resolveMachine({ product_id, product_name });
  const resolvedName = (machine && machine.name)
    || (product_name && product_name.trim())
    || (product_id && product_id.trim())
    || 'the selected machine';
  const resolvedId = (product_id && product_id.trim()) || (machine && machine.name) || null;

  // TODO: Replace this locally-generated confirmation with the real enquiry submission.
  const submittedAt = new Date().toISOString();
  const confirmationId = `ENQ-${Date.now().toString(36).toUpperCase()}`;
  const summaryMessage = `Thanks, ${customer_name.trim()} — your enquiry about the ${resolvedName} has been recorded and our team will follow up at ${trimmedEmail}${phone && phone.trim() ? ` or ${phone.trim()}` : ''}.`;

  return {
    content: [{
      type: 'text',
      text: `Enquiry recorded for the ${resolvedName} (${intended_use.trim()}) — confirmation #${confirmationId}. This records your interest so the team can follow up; it is not an order, price commitment, or a guaranteed appointment.`,
    }],
    structuredContent: {
      confirmation_id: confirmationId,
      status: 'received',
      message: summaryMessage,
      product_id: resolvedId,
      product_name: resolvedName,
      submitted_at: submittedAt,
    },
  };
};

/*
 * TODO: Replace the locally-generated confirmation with a real enquiry submission.
 *
 * Suggested endpoint pattern (update based on actual site API):
 *   POST ${process.env.API_BASE_URL}/machine-enquiries
 *   body: { product_id, product_name, intended_use, customer_name, email, phone, message }
 *
 * Environment variables to configure:
 *   API_BASE_URL   Base URL of the website's API
 *   API_KEY        API key if required (add to .env and app.config.yaml)
 *
 * Example fetch:
 *   const res = await fetch(`${process.env.API_BASE_URL}/machine-enquiries`, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.API_KEY}` },
 *     body: JSON.stringify({ product_id, product_name, intended_use, customer_name, email, phone, message }),
 *   })
 *   if (!res.ok) throw new Error(`API error: ${res.status}`)
 *   return await res.json()
 */
