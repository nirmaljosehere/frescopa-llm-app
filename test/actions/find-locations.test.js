const handler = require('../../actions/find-locations/index.js');

describe('find_locations handler', () => {
  test('content is an array of text blocks', async () => {
    const out = await handler({ postal_code: '90210' });
    expect(out).toHaveProperty('content');
    expect(Array.isArray(out.content)).toBe(true);
    expect(out.content[0]).toMatchObject({ type: 'text', text: expect.any(String) });
  });

  test('"Which Fréscopa locations or stockists are near postal code 90210?" returns locations', async () => {
    const out = await handler({ postal_code: '90210' });
    expect(out.content[0].text.length).toBeGreaterThan(0);
    expect(out.structuredContent.locations.length).toBeGreaterThan(0);
  });

  test('structuredContent is a plain object, not a bare array', async () => {
    const out = await handler({ postal_code: '90210' });
    expect(typeof out.structuredContent).toBe('object');
    expect(Array.isArray(out.structuredContent)).toBe(false);
    expect(Array.isArray(out.structuredContent.locations)).toBe(true);
  });

  test('returns error message when postal_code and location are both missing', async () => {
    const out = await handler({});
    expect(out.content[0].text).toMatch(/postal_code|location|provide/i);
    expect(out.structuredContent.locations).toEqual([]);
  });

  test('preserves latitude and longitude on returned locations', async () => {
    const out = await handler({ location: 'Los Angeles' });
    out.structuredContent.locations.forEach((loc) => {
      expect(loc).toHaveProperty('latitude');
      expect(loc).toHaveProperty('longitude');
    });
  });

  test('radius_miles filters out locations beyond the radius', async () => {
    const out = await handler({ postal_code: '90210', radius_miles: 0.0001 });
    out.structuredContent.locations.forEach((loc) => {
      expect(loc.distance_miles).toBeLessThanOrEqual(0.0001);
    });
  });
});
