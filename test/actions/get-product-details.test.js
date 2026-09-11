const handler = require('../../actions/get-product-details/index.js');

describe('get_product_details handler', () => {
  test('content is an array of text blocks', async () => {
    const out = await handler({ product_name: 'Frescopa Maestro 300' });
    expect(out).toHaveProperty('content');
    expect(Array.isArray(out.content)).toBe(true);
    expect(out.content[0]).toMatchObject({ type: 'text', text: expect.any(String) });
  });

  test('"Walk me through the Frescopa Maestro 300" returns the matching product', async () => {
    const out = await handler({ product_name: 'Frescopa Maestro 300' });
    expect(out.content[0].text.length).toBeGreaterThan(0);
    expect(out.structuredContent.name).toBe('Frescopa Maestro 300');
    expect(out.structuredContent.category).toBe('Coffee Machines');
    expect(out.structuredContent.price).toBe('$1,099.00');
  });

  test('structuredContent is a plain flat object, not a bare array', async () => {
    const out = await handler({ product_name: 'Frescopa Maestro 300' });
    expect(typeof out.structuredContent).toBe('object');
    expect(Array.isArray(out.structuredContent)).toBe(false);
    // Detail concept: fields are flat, not nested under a wrapper key.
    expect(out.structuredContent).not.toHaveProperty('product');
    expect(out.structuredContent).not.toHaveProperty('products');
  });

  test('matches case-insensitively on a partial name', async () => {
    const out = await handler({ product_name: 'maestro' });
    expect(out.structuredContent.name).toBe('Frescopa Maestro 300');
  });

  test('returns error message when no identifier is provided', async () => {
    const out = await handler({});
    expect(out.content[0].text).toMatch(/product_id|product_name|provide/i);
    expect(out.structuredContent).toEqual({});
  });

  test('unknown product returns not-found with empty structuredContent object', async () => {
    const out = await handler({ product_name: 'Nonexistent Brew 9000' });
    expect(out.content[0].text).toMatch(/no published product|not found|no results/i);
    expect(typeof out.structuredContent).toBe('object');
    expect(Array.isArray(out.structuredContent)).toBe(false);
    expect(out.structuredContent).toEqual({});
  });
});
