const handler = require('../../actions/get-mybarista-subscription-details/index.js')

describe('get_mybarista_subscription_details handler', () => {
    test('returns content block shape', async () => {
        const out = await handler({})
        expect(out).toHaveProperty('content')
        expect(Array.isArray(out.content)).toBe(true)
        expect(out.content[0]).toMatchObject({ type: 'text', text: expect.any(String) })
    })

    test('"Explain how the MyBarista subscription works" returns subscription details', async () => {
        const out = await handler({ include_current_offer: true, include_process: true })
        expect(out.content[0].text.length).toBeGreaterThan(0)
        expect(out.structuredContent.plan_name).toBe('MyBarista Monthly Coffee Subscription')
        expect(out.content[0].text).toMatch(/personalized|confirm/i)
    })

    test('structuredContent is a plain object, not a bare array', async () => {
        const out = await handler({})
        expect(typeof out.structuredContent).toBe('object')
        expect(Array.isArray(out.structuredContent)).toBe(false)
    })

    test('returns a flat detail object (no wrapper key)', async () => {
        const out = await handler({})
        expect(out.structuredContent).not.toHaveProperty('plans')
        expect(out.structuredContent).not.toHaveProperty('plan')
        expect(out.structuredContent).toHaveProperty('description')
    })

    test('include_process controls the personalization journey', async () => {
        const withProcess = await handler({ include_process: true })
        expect(Array.isArray(withProcess.structuredContent.personalization_process)).toBe(true)
        expect(withProcess.structuredContent.personalization_process.length).toBeGreaterThan(0)

        const withoutProcess = await handler({ include_process: false })
        expect(withoutProcess.structuredContent.personalization_process).toBeUndefined()
    })

    test('omits pricing and offer when the site does not publish them', async () => {
        const out = await handler({ include_current_offer: true })
        // samplePayload has an empty price and no published offer — neither should appear.
        expect(out.structuredContent.price).toBeUndefined()
        expect(out.structuredContent.current_offer).toBeUndefined()
    })
})
