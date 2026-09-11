const handler = require('../../actions/submit-machine-enquiry/index.js');

const validArgs = {
  product_name: 'Frescopa Maestro 300',
  intended_use: 'office kitchen',
  customer_name: 'Jamie Lee',
  email: 'jamie@example.com',
  phone: '555-0100',
  message: 'Interested in a demo.',
};

describe('submit_machine_enquiry handler', () => {
  test('content is an array of text blocks', async () => {
    const out = await handler(validArgs);
    expect(Array.isArray(out.content)).toBe(true);
    expect(out.content[0]).toMatchObject({ type: 'text', text: expect.any(String) });
  });

  test('"put me in touch about the Frescopa Maestro 300" records the enquiry', async () => {
    const out = await handler(validArgs);
    expect(out.content[0].text.length).toBeGreaterThan(0);
    expect(out.content[0].text).toMatch(/Frescopa Maestro 300/);
    expect(out.content[0].text).toMatch(/not an order|not a guaranteed|records your interest/i);
    expect(out.structuredContent.confirmation_id).toEqual(expect.any(String));
    expect(out.structuredContent.status).toBe('received');
    expect(out.structuredContent.product_name).toBe('Frescopa Maestro 300');
    expect(out.structuredContent.submitted_at).toEqual(expect.any(String));
  });

  test('structuredContent is a plain object, not a bare array', async () => {
    const out = await handler(validArgs);
    expect(typeof out.structuredContent).toBe('object');
    expect(Array.isArray(out.structuredContent)).toBe(false);
  });

  test('returns error message when required args are missing', async () => {
    const out = await handler({});
    expect(out.content[0].text).toMatch(/provide|intended_use|customer_name|email/i);
    expect(out.structuredContent.confirmation_id).toBeNull();
  });

  test('error branch keeps the same structuredContent key shape', async () => {
    const out = await handler({});
    const keys = Object.keys(out.structuredContent).sort();
    expect(keys).toEqual(
      ['confirmation_id', 'message', 'product_id', 'product_name', 'status', 'submitted_at'].sort(),
    );
  });

  test('rejects an invalid email address', async () => {
    const out = await handler({ ...validArgs, email: 'not-an-email' });
    expect(out.content[0].text).toMatch(/valid email/i);
    expect(out.structuredContent.confirmation_id).toBeNull();
  });

  test('resolves the machine by product_id when product_name is absent', async () => {
    const out = await handler({
      product_id: 'Fresco Deluxe',
      intended_use: 'home',
      customer_name: 'Sam',
      email: 'sam@example.com',
    });
    expect(out.structuredContent.product_name).toBe('Fresco Deluxe');
  });
});
