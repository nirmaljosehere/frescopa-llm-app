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

// Parse a price into a number for filtering/sorting. Handles "$1,099.00" and 14.99.
function parsePrice(value) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return NaN;
  const cleaned = value.replace(/[^0-9.]/g, '');
  return cleaned === '' ? NaN : parseFloat(cleaned);
}

module.exports = async ({
  query = '', category = '', min_price, max_price, sort_by = '',
} = {}) => {
  const q = typeof query === 'string' ? query.trim().toLowerCase() : '';
  const cat = typeof category === 'string' ? category.trim().toLowerCase() : '';
  const minP = typeof min_price === 'number' ? min_price : parsePrice(min_price);
  const maxP = typeof max_price === 'number' ? max_price : parsePrice(max_price);

  let results = MOCK_DATA.filter((item) => {
    if (cat && String(item.category || '').toLowerCase() !== cat) return false;
    if (q) {
      const haystack = `${item.name || ''} ${item.description || ''} ${item.category || ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    const price = parsePrice(item.price);
    if (!Number.isNaN(minP) && !Number.isNaN(price) && price < minP) return false;
    if (!Number.isNaN(maxP) && !Number.isNaN(price) && price > maxP) return false;
    return true;
  });

  if (sort_by === 'price_low_to_high') {
    results = [...results].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
  } else if (sort_by === 'price_high_to_low') {
    results = [...results].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
  } else if (sort_by === 'product_name') {
    results = [...results].sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
  }

  if (results.length === 0) {
    return {
      content: [{ type: 'text', text: 'No products found matching your search. Try refining by flavor, format, machine features, or budget.' }],
      // structuredContent.products — derived from action name "search_products" (bare array outputSchema rule)
      structuredContent: { products: [] },
    };
  }

  return {
    content: [{ type: 'text', text: `Found ${results.length} Fréscopa product${results.length === 1 ? '' : 's'} matching your search. Refine further by flavor, format, machine features, or budget to narrow things down.` }],
    // structuredContent.products — derived from action name "search_products" (bare array outputSchema rule)
    structuredContent: { products: results },
  };
};

/*
 * TODO: Replace MOCK_DATA with a real API call.
 *
 * Suggested endpoint pattern (update based on actual site API):
 *   GET ${process.env.API_BASE_URL}/products?query=${query}&category=${category}
 *       &min_price=${min_price}&max_price=${max_price}&sort_by=${sort_by}
 *
 * Environment variables to configure:
 *   API_BASE_URL   Base URL of the website's API
 *   API_KEY        API key if required (add to .env and app.config.yaml)
 *
 * Example fetch:
 *   const res = await fetch(
 *     `${process.env.API_BASE_URL}/products?query=${encodeURIComponent(query)}`,
 *     { headers: { Authorization: `Bearer ${process.env.API_KEY}` } }
 *   )
 *   if (!res.ok) throw new Error(`API error: ${res.status}`)
 *   return await res.json()
 */
