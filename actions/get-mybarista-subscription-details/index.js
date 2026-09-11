// MOCK_DATA — real data from Action Planner (samplePayload), reformatted as a JS const.
// TODO: Replace MOCK_DATA with a real API call.
// See the TODO block below the handler for endpoint details.
const MOCK_DATA = [
    {
        name: 'MyBarista Monthly Coffee Subscription',
        description: 'A monthly subscription that curates hand-selected coffees to your flavor profile. Take a four-question quiz, receive a curated delivery each month, and rate the coffees you try so future shipments get more personalized.',
        price: '',
        category: 'Coffee Subscription',
    },
]

// The published personalization journey described by the subscription — the quiz,
// the curated delivery, and the post-delivery rating feedback loop.
const PERSONALIZATION_PROCESS = [
    'Take a four-question preference quiz to establish your flavor profile.',
    'Receive a curated coffee delivery each month, hand-selected to your profile.',
    'Rate the coffees you try so future shipments get more personalized.',
]

module.exports = async ({ include_current_offer = true, include_process = true } = {}) => {
    const item = MOCK_DATA[0]

    if (!item || !item.name) {
        // No subscription available — detail tools return {} (never null/omitted) on no-match,
        // so the widget renders its empty state instead of misreading the whole response.
        return {
            content: [{ type: 'text', text: 'No published MyBarista subscription details are available right now.' }],
            structuredContent: {},
        }
    }

    // Map the available published fields onto the outputSchema's plan shape. Only include
    // pricing/offer fields the site actually provides — exact charges and introductory offers
    // are confirmed during enrollment, so they stay absent when the site does not publish them.
    const plan = {
        plan_name: item.name,
        description: item.description,
        category: item.category,
    }
    if (item.cadence) plan.cadence = item.cadence
    if (item.price !== undefined && item.price !== null && item.price !== '') {
        plan.price = item.price
        if (item.currency) plan.currency = item.currency
    }
    if (include_current_offer && item.current_offer) plan.current_offer = item.current_offer
    if (item.first_shipment_timing) plan.first_shipment_timing = item.first_shipment_timing
    if (include_process) {
        plan.personalization_process = Array.isArray(item.personalization_process) && item.personalization_process.length
            ? item.personalization_process
            : PERSONALIZATION_PROCESS
    }
    if (item.subscription_url) plan.subscription_url = item.subscription_url

    const text = `${plan.plan_name}: a monthly subscription that gets more personalized as you rate each delivered coffee — your ratings refine future curated shipments over time. `
        + 'Details shown here are what the site currently publishes; exact pricing, introductory offers, and first-shipment timing are confirmed during enrollment.'

    return {
        content: [{ type: 'text', text }],
        // structuredContent — flat single-object detail shape (widget reads sc directly, no wrapper key)
        structuredContent: { ...plan },
    }
}

/*
 * TODO: Replace MOCK_DATA with a real API call.
 *
 * Suggested endpoint pattern (update based on actual site API):
 *   GET ${process.env.API_BASE_URL}/subscriptions/mybarista
 *
 * Environment variables to configure:
 *   API_BASE_URL   Base URL of the website's API
 *   API_KEY        API key if required (add to .env and app.config.yaml)
 *
 * Example fetch:
 *   const res = await fetch(
 *     `${process.env.API_BASE_URL}/subscriptions/mybarista`,
 *     { headers: { 'Authorization': `Bearer ${process.env.API_KEY}` } }
 *   )
 *   if (!res.ok) throw new Error(`API error: ${res.status}`)
 *   return await res.json()
 */
