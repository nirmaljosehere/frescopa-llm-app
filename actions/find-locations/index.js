// PLACEHOLDER — no real data configured for this tool yet.
// This is NOT real data. Replace MOCK_DATA with a real API call —
// see the TODO block below the handler for endpoint details.
const MOCK_DATA = [
  {
    store_id: 'N/A',
    name: 'Sample Location — replace with real data',
    address: 'N/A',
    distance_miles: 0,
    latitude: 0,
    longitude: 0,
    phone: 'N/A',
    hours: 'N/A',
    location_type: 'N/A',
    directions_url: 'N/A',
  },
];

module.exports = async ({ postal_code = '', location = '', radius_miles = 0 } = {}) => {
  const near = String(postal_code || '').trim() || String(location || '').trim();

  if (!near) {
    return {
      content: [{ type: 'text', text: 'Please provide a postal_code or location to search near.' }],
      // structuredContent.locations — bare array outputSchema; key derived from actionName "find_locations"
      structuredContent: { locations: [] },
    };
  }

  const radius = typeof radius_miles === 'number' && radius_miles > 0 ? radius_miles : null;

  let results = MOCK_DATA.slice();
  if (radius !== null) {
    results = results.filter((s) => typeof s.distance_miles !== 'number' || s.distance_miles <= radius);
  }
  results = results.slice().sort((a, b) => (a.distance_miles || 0) - (b.distance_miles || 0));

  if (results.length === 0) {
    return {
      content: [{ type: 'text', text: `No Fréscopa locations found near ${near}.` }],
      // structuredContent.locations — bare array outputSchema; key derived from actionName "find_locations"
      structuredContent: { locations: [] },
    };
  }

  return {
    content: [{ type: 'text', text: `Found ${results.length} Fréscopa location${results.length === 1 ? '' : 's'} near ${near}.` }],
    // structuredContent.locations — bare array outputSchema; key derived from actionName "find_locations"
    structuredContent: { locations: results },
  };
};

/*
 * TODO: Replace MOCK_DATA with a real API call.
 *
 * Suggested endpoint pattern (update based on actual site API):
 *   GET ${process.env.API_BASE_URL}/locations?postal_code=${postal_code}&radius=${radius_miles}
 *
 * Environment variables to configure:
 *   API_BASE_URL   Base URL of the website's API
 *   API_KEY        API key if required (add to .env and app.config.yaml)
 *
 * Authentication: check the website's developer docs or network requests
 *   captured during browsing for the correct auth header pattern.
 *
 * Example fetch:
 *   const res = await fetch(
 *     `${process.env.API_BASE_URL}/locations?postal_code=${encodeURIComponent(postal_code)}`,
 *     { headers: { 'Authorization': `Bearer ${process.env.API_KEY}` } }
 *   )
 *   if (!res.ok) throw new Error(`API error: ${res.status}`)
 *   return await res.json()
 */
