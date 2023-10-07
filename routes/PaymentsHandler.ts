import bodyParser from 'body-parser';
import { products } from '../structures/json/products.json';
const stripe = require('stripe')(process.env.STRIPE_KEY);

const router = require('express').Router();

router.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const event = JSON.parse(req.body.toString());

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
                expand: ['line_items.data']
            });

            if (expandedSession.customer) {
                await stripe.customers.update(session.customer, {
                    metadata: {
                        discord_id: expandedSession.custom_fields[0].text.value
                    }
                });
            } else {
                await stripe.customers.create({
                    email: expandedSession.customer_details.email,
                    metadata: {
                        discord_id: expandedSession.custom_fields[0].text.value
                    }
                });
            }

            const product = () => {
                const product = products.find(product => product.id === expandedSession.line_items.data[0].price.product);
                return product;
            }

            switch (product().type) {
                case 'subscription': {
                    // TODO
                }

                case 'one-time': {
                    // TODO
                }
            }
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            const customer = await stripe.customers.retrieve(subscription.customer, {
                expand: ['subscriptions']
            });

            console.log(customer);
            // TO DO: When the subscription ends, remove the premium from the user filtering by the Discord ID located in metadata
        }
    }
});

module.exports = router;