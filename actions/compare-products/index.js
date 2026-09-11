// TODO: Replace MOCK_DATA with a real API call.
// See the TODO block below the handler for endpoint details.
// MOCK_DATA is the Fréscopa catalogue (from samplePayload) the comparison looks up against.
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

function findProduct(identifier) {
  const q = String(identifier).trim().toLowerCase();
  return MOCK_DATA.find((p) => (p.product_id || '').toLowerCase() === q)
    || MOCK_DATA.find((p) => p.name.toLowerCase() === q)
    || MOCK_DATA.find((p) => p.name.toLowerCase().includes(q));
}

function buildAttributes(a, b) {
  const rows = [];
  const add = (attribute, fv, sv) => {
    if (fv == null && sv == null) return;
    const first = String(fv == null ? '—' : fv);
    const second = String(sv == null ? '—' : sv);
    rows.push({
      attribute,
      first_product_value: first,
      second_product_value: second,
      tradeoff: first.trim() === second.trim()
        ? `Both share the same ${attribute.toLowerCase()}.`
        : `${a.name} lists ${first}; ${b.name} lists ${second}.`,
    });
  };
  add('Price', a.price, b.price);
  add('Category', a.category, b.category);
  add('Availability', a.availability, b.availability);
  return rows;
}

module.exports = async ({ product_ids = [], priorities = [] }) => {
  if (!Array.isArray(product_ids) || product_ids.length !== 2) {
    return {
      content: [{ type: 'text', text: 'Please provide exactly two product identifiers to compare.' }],
      structuredContent: { products: [], comparison_attributes: [], summary: null },
    };
  }

  const first = findProduct(product_ids[0]);
  const second = findProduct(product_ids[1]);

  if (!first || !second) {
    const missing = [!first ? product_ids[0] : null, !second ? product_ids[1] : null].filter(Boolean);
    return {
      content: [{ type: 'text', text: `Could not find these products to compare: ${missing.join(', ')}.` }],
      structuredContent: { products: [], comparison_attributes: [], summary: null },
    };
  }

  const products = [first, second];
  const comparison_attributes = buildAttributes(first, second);

  const priorityText = Array.isArray(priorities) && priorities.length
    ? ` Prioritizing ${priorities.join(', ')}, weigh each against your budget and workflow.`
    : '';
  const summary = `${first.name} and ${second.name} suit different needs — compare price, format, and features side by side rather than picking an outright winner.${priorityText}`;

  return {
    content: [{ type: 'text', text: `Comparing ${first.name} against ${second.name} side by side.` }],
    structuredContent: { products, comparison_attributes, summary },
  };
};

/*
 * TODO: Replace MOCK_DATA with a real API call.
 *
 * Suggested endpoint pattern (update based on actual site API):
 *   GET ${process.env.API_BASE_URL}/products?ids=${product_ids.join(',')}
 *
 * Environment variables to configure:
 *   API_BASE_URL   Base URL of the website's API
 *   API_KEY        API key if required (add to .env and app.config.yaml)
 *
 * Example fetch:
 *   const res = await fetch(
 *     `${process.env.API_BASE_URL}/products?ids=${encodeURIComponent(product_ids.join(','))}`,
 *     { headers: { 'Authorization': `Bearer ${process.env.API_KEY}` } }
 *   )
 *   if (!res.ok) throw new Error(`API error: ${res.status}`)
 *   return await res.json()
 */
