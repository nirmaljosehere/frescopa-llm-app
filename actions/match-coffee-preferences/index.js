// TODO: Replace MOCK_DATA with a real API call.
// See the TODO block below the handler for endpoint details.
// Real catalog data from Action Planner (samplePayload), used verbatim.
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

const KNOWN_NOTES = [
    'chocolate', 'dark chocolate', 'caramel', 'nuts', 'nutty', 'nuttiness', 'toasted nuts',
    'fruit', 'fruity', 'fruitiness', 'cherry', 'vanilla', 'floral', 'smoky', 'smokiness',
    'bitter', 'sour',
];

const norm = (s) => String(s || '').trim().toLowerCase();

// Stem a flavor token so "smoky" matches "smokiness", "fruit" matches "fruity", etc.
const stem = (s) => norm(s).replace(/(iness|ness|ity|y|s)$/, '');

// True if the coffee's description text carries the given flavor token (stem-aware).
function textHasFlavor(text, token) {
    const t = stem(token);
    if (!t) return false;
    if (text.includes(norm(token))) return true;
    return text.split(/[^a-z]+/).some((w) => w && stem(w) === t);
}

// Derive published tasting notes from a coffee's description text.
function extractNotes(description) {
    const text = norm(description);
    const found = [];
    KNOWN_NOTES.forEach((note) => {
        if (text.includes(note) && !found.some((f) => f.includes(note) || note.includes(f))) {
            found.push(note);
        }
    });
    return found;
}

function priceToNumber(price) {
    if (typeof price === 'number') return price;
    const n = parseFloat(String(price).replace(/[^0-9.]/g, ''));
    return Number.isNaN(n) ? null : n;
}

module.exports = async ({
    roast_preference = '',
    flavor_preferences = [],
    format_preference = '',
    drinking_moment = '',
    avoid_flavors = [],
} = {}) => {
    if (!Array.isArray(flavor_preferences) || flavor_preferences.length === 0) {
        return {
            content: [{ type: 'text', text: 'Please provide at least one flavor_preference (e.g. chocolate, caramel, nuts) so I can match Fréscopa coffees.' }],
            // structuredContent.coffees — bare array outputSchema; key derived from actionName "match_coffee_preferences"
            structuredContent: { coffees: [] },
        };
    }

    const wants = flavor_preferences.map(norm).filter(Boolean);
    const avoid = (Array.isArray(avoid_flavors) ? avoid_flavors : []).map(norm).filter(Boolean);
    const roast = norm(roast_preference);
    const format = norm(format_preference);

    // Match only coffees — machines and other categories are never flavor matches.
    const coffees = MOCK_DATA.filter((item) => norm(item.category) !== 'coffee machines');

    const scored = coffees.map((item) => {
        const notes = extractNotes(item.description);
        const notesText = norm(item.description);
        const reasons = [];
        let score = 0;

        wants.forEach((w) => {
            if (textHasFlavor(notesText, w)) {
                score += 2;
                reasons.push(`Features your preferred ${w} notes`);
            }
        });

        let excluded = false;
        avoid.forEach((a) => {
            if (textHasFlavor(notesText, a)) {
                score -= 3;
                excluded = true;
            }
        });

        if (roast && norm(item.name).includes(roast)) {
            score += 1;
            reasons.push(`Matches your ${roast_preference} roast preference`);
        }
        if (format && norm(item.category).includes(format)) {
            score += 1;
            reasons.push(`Available in your preferred ${item.category} format`);
        }

        return {
            product_id: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            name: item.name,
            category: item.category,
            price: priceToNumber(item.price),
            currency: 'USD',
            tasting_notes: notes,
            match_score: score,
            match_reasons: reasons,
            image_url: item.image_url,
            product_url: '',
            _excluded: excluded,
        };
    });

    const matches = scored
        .filter((c) => !c._excluded && c.match_score > 0)
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, 4)
        .map(({ _excluded, ...rest }) => rest);

    if (matches.length === 0) {
        return {
            content: [{ type: 'text', text: `No Fréscopa coffees clearly matched those preferences — try adjusting the flavor notes if the results feel too bold, light, sweet, or smoky.` }],
            structuredContent: { coffees: [] },
        };
    }

    const noteSummary = wants.join(', ');
    const lead = `Found ${matches.length} Fréscopa ${matches.length === 1 ? 'coffee' : 'coffees'} matching a ${noteSummary} taste profile.`;
    const why = ` The top pick, ${matches[0].name}, leans into those notes${avoid.length ? ` while steering clear of ${avoid.join(', ')}` : ''}. Adjust your preferences if the results feel too bold, light, sweet, or smoky.`;

    return {
        content: [{ type: 'text', text: lead + why }],
        // structuredContent.coffees — bare array outputSchema; key derived from actionName "match_coffee_preferences"
        structuredContent: { coffees: matches },
    };
};

/*
 * TODO: Replace MOCK_DATA with a real API call.
 *
 * Suggested endpoint pattern (update based on actual site API):
 *   GET ${process.env.API_BASE_URL}/coffees?notes=${flavor_preferences.join(',')}&roast=${roast_preference}
 *
 * Environment variables to configure:
 *   API_BASE_URL   Base URL of the Fréscopa catalog API
 *   API_KEY        API key if required (add to .env and app.config.yaml)
 *
 * Example fetch:
 *   const res = await fetch(
 *     `${process.env.API_BASE_URL}/coffees?notes=${encodeURIComponent(flavor_preferences.join(','))}`,
 *     { headers: { 'Authorization': `Bearer ${process.env.API_KEY}` } }
 *   )
 *   if (!res.ok) throw new Error(`API error: ${res.status}`)
 *   return await res.json()
 */
