const handler = require('../../actions/search-products/index.js');

describe('search_products handler', () => {
  test('content is an array of text blocks', async () => {
    const out = await handler({ query: 'coffee' });
    expect(Array.isArray(out.content)).toBe(true);
    expect(out.content[0]).toMatchObject({ type: 'text', text: expect.any(String) });
  });

  test('"browse Fréscopa dark roast coffees and machines" returns products', async () => {
    const out = await handler({ query: 'roast' });
    expect(out.content[0].text.length).toBeGreaterThan(0);
    expect(out.structuredContent.products.length).toBeGreaterThan(0);
  });

  test('structuredContent is a plain object, not a bare array', async () => {
    const out = await handler({ query: 'coffee' });
    expect(typeof out.structuredContent).toBe('object');
    expect(Array.isArray(out.structuredContent)).toBe(false);
    expect(Array.isArray(out.structuredContent.products)).toBe(true);
  });

  test('empty args returns the full catalog', async () => {
    const out = await handler({});
    expect(out.structuredContent.products.length).toBe(6);
  });

  test('filters by category', async () => {
    const out = await handler({ category: 'Coffee Machines' });
    const { products } = out.structuredContent;
    expect(products.length).toBeGreaterThan(0);
    expect(products.every((p) => p.category === 'Coffee Machines')).toBe(true);
  });

  test('filters by max_price', async () => {
    const out = await handler({ max_price: 20 });
    const { products } = out.structuredContent;
    expect(products.every((p) => parseFloat(String(p.price).replace(/[^0-9.]/g, '')) <= 20)).toBe(true);
    expect(products.some((p) => p.name === 'Fresco Deluxe')).toBe(false);
  });

  test('sorts by price_low_to_high', async () => {
    const out = await handler({ sort_by: 'price_low_to_high' });
    const prices = out.structuredContent.products.map((p) => parseFloat(String(p.price).replace(/[^0-9.]/g, '')));
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  test('returns empty products array when nothing matches', async () => {
    const out = await handler({ query: 'zzz-nonexistent-product-zzz' });
    expect(out.content[0].text).toMatch(/no products found/i);
    expect(out.structuredContent.products).toEqual([]);
  });
});
