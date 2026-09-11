const handler = require('../../actions/compare-products/index.js');

describe('compare_products action', () => {
  test('happy path — compares two products side by side', async () => {
    const res = await handler({ product_ids: ['Frescopa Maestro 300', 'Fresco Deluxe'] });

    expect(Array.isArray(res.content)).toBe(true);
    expect(res.content[0].type).toBe('text');
    expect(res.content[0].text).toMatch(/Frescopa Maestro 300/);

    // structuredContent is a plain object, not a bare array
    expect(Array.isArray(res.structuredContent)).toBe(false);
    expect(typeof res.structuredContent).toBe('object');

    expect(res.structuredContent.products).toHaveLength(2);
    expect(res.structuredContent.products[0].name).toBe('Frescopa Maestro 300');
    expect(res.structuredContent.products[1].name).toBe('Fresco Deluxe');
    expect(res.structuredContent.comparison_attributes.length).toBeGreaterThan(0);
    expect(typeof res.structuredContent.summary).toBe('string');
  });

  test('derives price and category comparison rows with tradeoffs', async () => {
    const res = await handler({ product_ids: ['Frescopa Maestro 300', 'Fresco Deluxe'] });
    const attrs = res.structuredContent.comparison_attributes;

    const price = attrs.find((a) => a.attribute === 'Price');
    expect(price).toBeDefined();
    expect(price.first_product_value).toBe('$1,099.00');
    expect(price.second_product_value).toBe('$499.00');
    expect(price.tradeoff).toEqual(expect.any(String));

    const category = attrs.find((a) => a.attribute === 'Category');
    expect(category).toBeDefined();
    expect(category.tradeoff).toMatch(/same category/i);
  });

  test('folds priorities into the summary', async () => {
    const res = await handler({
      product_ids: ['Frescopa Maestro 300', 'Fresco Deluxe'],
      priorities: ['capacity', 'features', 'price'],
    });
    expect(res.structuredContent.summary).toMatch(/capacity, features, price/);
  });

  test('missing required arg — not exactly two ids', async () => {
    const res = await handler({ product_ids: ['Frescopa Maestro 300'] });

    expect(Array.isArray(res.content)).toBe(true);
    expect(res.content[0].text).toMatch(/exactly two/i);
    expect(res.structuredContent.products).toEqual([]);
    expect(res.structuredContent.comparison_attributes).toEqual([]);
    expect(res.structuredContent.summary).toBeNull();
  });

  test('defaults to empty comparison when no args provided', async () => {
    const res = await handler({});
    expect(res.structuredContent.products).toEqual([]);
  });

  test('unknown product identifier — returns empty comparison', async () => {
    const res = await handler({ product_ids: ['Frescopa Maestro 300', 'Nonexistent Machine'] });

    expect(res.content[0].text).toMatch(/could not find/i);
    expect(res.structuredContent.products).toEqual([]);
    expect(res.structuredContent.summary).toBeNull();
  });
});
