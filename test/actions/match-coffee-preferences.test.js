const handler = require('../../actions/match-coffee-preferences/index.js');

describe('match_coffee_preferences handler', () => {
    test('content is an array of text blocks', async () => {
        const out = await handler({ flavor_preferences: ['chocolate'] });
        expect(out).toHaveProperty('content');
        expect(Array.isArray(out.content)).toBe(true);
        expect(out.content[0]).toMatchObject({ type: 'text', text: expect.any(String) });
    });

    test('"My team loves smooth, chocolatey coffee but hates anything bitter or sour" returns matching coffees', async () => {
        const out = await handler({
            flavor_preferences: ['chocolate'],
            avoid_flavors: ['bitter', 'sour'],
        });
        expect(out.content[0].text.length).toBeGreaterThan(0);
        expect(out.structuredContent.coffees.length).toBeGreaterThan(0);
    });

    test('structuredContent is a plain object, not a bare array', async () => {
        const out = await handler({ flavor_preferences: ['caramel'] });
        expect(typeof out.structuredContent).toBe('object');
        expect(Array.isArray(out.structuredContent)).toBe(false);
        expect(Array.isArray(out.structuredContent.coffees)).toBe(true);
    });

    test('returns error message when required flavor_preferences is missing', async () => {
        const out = await handler({});
        expect(out.content[0].text).toMatch(/flavor_preference|provide/i);
        expect(out.structuredContent.coffees).toEqual([]);
    });

    test('never returns coffee machines as matches', async () => {
        const out = await handler({ flavor_preferences: ['chocolate', 'caramel', 'nuts'] });
        const cats = out.structuredContent.coffees.map((c) => c.category.toLowerCase());
        expect(cats.some((c) => c === 'coffee machines')).toBe(false);
    });

    test('excludes coffees whose notes include an avoided flavor', async () => {
        const out = await handler({
            flavor_preferences: ['chocolate'],
            avoid_flavors: ['smoky'],
        });
        const names = out.structuredContent.coffees.map((c) => c.name);
        // Dark Roast carries "smokiness" — must be filtered out when smoky is avoided.
        expect(names).not.toContain('House Blend - Dark Roast');
    });

    test('results are ranked by match_score descending and capped at 4', async () => {
        const out = await handler({ flavor_preferences: ['chocolate', 'caramel', 'nuts', 'fruit'] });
        const scores = out.structuredContent.coffees.map((c) => c.match_score);
        expect(out.structuredContent.coffees.length).toBeLessThanOrEqual(4);
        const sorted = [...scores].sort((a, b) => b - a);
        expect(scores).toEqual(sorted);
    });

    test('returns empty coffees when no flavor matches', async () => {
        const out = await handler({ flavor_preferences: ['lavender'] });
        expect(out.structuredContent.coffees).toEqual([]);
        expect(out.content[0].text).toMatch(/no fréscopa coffees|adjust/i);
    });
});
