// TODO: Replace MOCK_DATA with a real API call.
// See the TODO block below the handler for endpoint details.
const MOCK_DATA = [
  {
    name: 'House Blend - Dark Roast',
    description: 'A bold blend of Arabica and Robusta beans with notes of dark chocolate, toasted nuts, and a hint of smokiness.',
    image_url: 'https://delivery-p158081-e1683323.adobeaemcloud.com/adobe/assets/urn:aaid:aem:3c43c4b2-5e63-42ca-a80b-e63d134a1cbe/as/FRES-COF-001.webp?quality=80&width=960&height=1191',
    price: '$14.99',
    category: 'Bagged Coffee',
  },
  {
    name: 'House Blend - Expresso',
    description: 'A rich, full-bodied coffee with notes of dark chocolate, caramel, and nuttiness.',
    image_url: 'https://delivery-p158081-e1683323.adobeaemcloud.com/adobe/assets/urn:aaid:aem:3df2b232-b4f1-4d4e-ac8e-2b76c28fb00e/as/FRES-COF-002.webp?quality=80&width=960&height=1191',
    price: '$14.99',
    category: 'Coffee Pods',
  },
  {
    name: 'House Blend - Medium Roast',
    description: 'A smooth blend with bold notes of caramel, toasted nuts, and fruitiness for a flavorful, aromatic cup.',
    image_url: 'https://delivery-p158081-e1683323.adobeaemcloud.com/adobe/assets/urn:aaid:aem:19414faa-96e6-489d-9c62-5f3c3bc708d7/as/FRES-COF-003.webp?quality=80&width=960&height=1191',
    price: '$14.99',
    category: 'Bagged Coffee',
  },
  {
    name: 'Morning Muse - Light Roast',
    description: 'A Colombian roast with caramel, chocolate, and cherry flavor.',
    image_url: 'https://delivery-p158081-e1683323.adobeaemcloud.com/adobe/assets/urn:aaid:aem:e4be36fc-dc7c-4374-9505-a89b3c59271b/as/FRES-COF-004.webp?quality=80&width=960&height=1191',
    price: '$3.99',
    category: 'Bagged Coffee',
  },
  {
    name: 'Fresco Deluxe',
    description: 'Triple-nozzle machine with timed brewing, adjustable grind coarseness, and custom drink settings.',
    image_url: 'https://delivery-p158081-e1683323.adobeaemcloud.com/adobe/assets/urn:aaid:aem:37d0c924-9f9e-4622-a4ba-121a2b7d5fff/as/FRES-MAC-002.webp?quality=80&width=960&height=1191',
    price: '$499.00',
    category: 'Coffee Machines',
  },
  {
    name: 'Frescopa Maestro 300',
    description: 'Fully automatic bean-to-cup machine with a built-in grinder and automatic milk system.',
    image_url: 'https://delivery-p158081-e1683323.adobeaemcloud.com/adobe/assets/urn:aaid:aem:1fd8810d-d13a-49fd-af60-a8df5ee209e3/as/FRES-MAC-005.webp?quality=80&width=960&height=1191',
    price: '$1,099.00',
    category: 'Coffee Machines',
  },
];

module.exports = async ({ product_id = '', product_name = '' } = {}) => {
  const idQuery = typeof product_id === 'string' ? product_id.trim() : '';
  const nameQuery = typeof product_name === 'string' ? product_name.trim() : '';

  if (!idQuery && !nameQuery) {
    return {
      content: [{ type: 'text', text: 'Please provide a product_id or product_name to look up.' }],
      structuredContent: {},
    };
  }

  const idLower = idQuery.toLowerCase();
  const nameLower = nameQuery.toLowerCase();

  const item = MOCK_DATA.find((p) => idQuery && p.product_id && String(p.product_id).toLowerCase() === idLower)
    || MOCK_DATA.find((p) => nameQuery && p.name.toLowerCase() === nameLower)
    || MOCK_DATA.find((p) => nameQuery && p.name.toLowerCase().includes(nameLower));

  if (!item) {
    const asked = nameQuery || idQuery;
    return {
      content: [{ type: 'text', text: `No published product found matching "${asked}".` }],
      structuredContent: {},
    };
  }

  const summary = `${item.name} (${item.category}) is listed at ${item.price}. ${item.description} `
    + 'Consider whether its defining qualities suit your intended use, and confirm current price, '
    + 'availability, and any product options before purchasing.';

  // structuredContent — flat single-object detail shape (widget reads sc directly, no wrapper key)
  return {
    content: [{ type: 'text', text: summary }],
    structuredContent: { ...item },
  };
};

/*
 * TODO: Replace MOCK_DATA with a real API call.
 *
 * Suggested endpoint pattern (update based on actual site API):
 *   GET ${process.env.API_BASE_URL}/products/${product_id}
 *   GET ${process.env.API_BASE_URL}/products?name=${product_name}
 *
 * Environment variables to configure:
 *   API_BASE_URL   Base URL of the website's API
 *   API_KEY        API key if required (add to .env and app.config.yaml)
 *
 * Example fetch:
 *   const res = await fetch(
 *     `${process.env.API_BASE_URL}/products/${encodeURIComponent(product_id)}`,
 *     { headers: { Authorization: `Bearer ${process.env.API_KEY}` } }
 *   )
 *   if (!res.ok) throw new Error(`API error: ${res.status}`)
 *   return await res.json()
 */
