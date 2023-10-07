import bodyParser from 'body-parser';
const stripe = require('stripe')(process.env.STRIPE_KEY);

const router = require('express').Router();

router.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const event = JSON.parse(req.body.toString());

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
                expand: ['line_items.data', 'customer', 'customer_details', 'custom_fields']
            });

            await stripe.customers.update(session.customer, {
                metadata: {
                    discord_id: expandedSession.custom_fields[0].text.value
                }
            });
        
            // TO DO: Add the premium to the user filtering by the Discord ID located in metadata
            // TO DO: Add the product to the user filtering by the Discord ID located in metadata
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            const customer = await stripe.customers.retrieve(subscription.customer, {
                expand: ['subscriptions', 'customer', 'customer_details', 'custom_fields']
            });

            console.log({
                "comprador": customer.customer_details.name,
                "ID da conta Discord": customer.custom_fields[0].text.value,
                "Produto": subscription.plan.nickname,
                "ID do Produto": subscription.plan.product,
                "ID do customer": subscription.customer,
            });
            // TO DO: When the subscription ends, remove the premium from the user filtering by the Discord ID located in metadata
        }
    }
});

module.exports = router;