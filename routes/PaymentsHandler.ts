import bodyParser from 'body-parser';
const stripe = require('stripe')(process.env.STRIPE_KEY);

const router = require('express').Router();

router.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const event = JSON.parse(req.body.toString());
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;


    }
    res.json({ received: true });
});

module.exports = router;