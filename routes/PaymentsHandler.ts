import bodyParser from 'body-parser';
import { products } from '../utils/json/products.json';
import { database } from '..';
import { rest } from '..';
import { StripeEvents, StripeEventsReasons } from '../utils/types/stripe';
const stripe = require('stripe')(process.env.STRIPE_KEY_TEST);

const router = require('express').Router();

router.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const event = req.body;
    const sig = req.headers['stripe-signature'];

    if (!sig) return res.status(400).send('No signature found!');
    if (!event) return res.status(400).send('No event found!');

    res.status(200).send();

    try {
        switch (event.type) {
            case StripeEvents.checkoutSessionCompleted:
                await handleCheckoutSessionCompleted(event);
                break;
            case StripeEvents.customerSubscriptionDeleted:
                await handleSubscriptionDeleted(event);
                break;
            case StripeEvents.customerSubscriptionUpdated:
                await handleSubscriptionUpdated(event);
                break;
            case StripeEvents.invoicePaymentSucceeded:
                await handleInvoicePaymentSucceeded(event);
                break;
            default:
                break;
        }
    } catch (err) {
        console.error(`Error handling event ${event.type}:`, err);
    }
});

async function handleCheckoutSessionCompleted(event) {
    const session = event.data.object;
    const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items.data']
    });

    const customerData = {
        email: expandedSession.customer_details.email,
        metadata: { discord_id: expandedSession.custom_fields[0].text.value }
    };

    if (expandedSession.customer) {
        await stripe.customers.update(session.customer, customerData);
    } else {
        await stripe.customers.create(customerData);
    }

    const product = products.find(product => product.id === expandedSession.line_items.data[0].price.product);

    switch (product.type) {
        case 'subscription':
            await handleSubscriptionProduct(expandedSession, product);
            break;
        case 'one-time':
            await handleOneTimeProduct(expandedSession, product);
            break;
    }
}

async function handleSubscriptionProduct(expandedSession, product) {
    const user = await database.getUser(expandedSession.custom_fields[0].text.value);
    const date = new Date();
    date.setMonth(date.getMonth() + 1);

    if (product.pType !== 1) {
        const guildPremium = await database.registerKey(expandedSession.custom_fields[0].text.value, date, product.pType);
        user.userPremium.premiumType = product.pType;
        user.userPremium.premiumDate = Date.now();
        user.userPremium.premium = true;
        await sendSubscriptionMessage(expandedSession, product, guildPremium.key);
    }

    user.userCakes.balance += product.cakes;
    user.userTransactions.push(createTransaction('premiumPerk', expandedSession.custom_fields[0].text.value, product.cakes));
    await user.save();
}

async function handleOneTimeProduct(expandedSession, product) {
    const user = await database.getUser(expandedSession.custom_fields[0].text.value);
    user.userCakes.balance += product.cakes;
    user.userTransactions.push(createTransaction('bought', expandedSession.custom_fields[0].text.value, product.cakes));
    await user.save();
    await sendOneTimeMessage(expandedSession, product);
}

function createTransaction(type, to, quantity) {
    return {
        type,
        to,
        from: 'Foxy',
        date: Date.now(),
        received: true,
        quantity
    };
}

async function sendSubscriptionMessage(expandedSession, product, key) {
    const messages = {
        1: {
            title: "Obrigada por me ajudar a ficar online, yay!",
            description: `Muito obrigada por comprar **${product.name}**! Você ganhou **${product.cakes.toLocaleString('pt-BR')} Cakes**!`,
            image: "https://cdn.discordapp.com/attachments/1078322762550083736/1160621235525386240/tier1.png"
        },
        2: {
            title: "Obrigada por me ajudar a ficar online, yay!",
            description: `Yay! Obrigada por comprar **${product.name}**! Você ganhou **${product.cakes.toLocaleString('pt-BR')} Cakes** e uma key: \`\`\`${key}\`\`\``,
            image: "https://cdn.discordapp.com/attachments/1078322762550083736/1160621235751895050/tier2.png"
        },
        3: {
            title: "Obrigada por me ajudar a ficar online, yay!",
            description: `Você comprou **${product.name}**! Você ganhou **${product.cakes.toLocaleString('pt-BR')} Cakes** e uma key: \`\`\`${key}\`\`\``,
            image: "https://cdn.discordapp.com/attachments/1078322762550083736/1160621236003549184/tier3.png"
        }
    };

    await sendDirectMessage(expandedSession.custom_fields[0].text.value, messages[product.pType]);
}

async function sendOneTimeMessage(expandedSession, product) {
    const message = {
        title: '<:foxy_yay:1070906796274888795> **|** Obrigada por comprar cakes!',
        description: `Obrigada por comprar **${product.name}**! Você pode utilizar na minha lojinha ou enviar para outras pessoas. Obrigada por me ajudar a ficar online!`,
        color: 0xe7385d,
        footer: { text: "Obrigada por me ajudar a ficar online!" }
    };
    await sendDirectMessage(expandedSession.custom_fields[0].text.value, message);
}

async function sendDirectMessage(userId, content) {
    try {
        await rest.sendDirectMessage(userId, { embeds: [content] });
    } catch (err) {
        console.error(`Error sending direct message:`, err);
    }
}

async function handleSubscriptionDeleted(event) {
    const subscription = event.data.object;
    const customer = await stripe.customers.retrieve(subscription.customer, { expand: ['subscriptions'] });
    const user = await database.getUser(customer.metadata.discord_id);

    user.userPremium.premiumType = null;
    user.userPremium.premiumDate = null;
    user.userPremium.premium = false;
    await user.save();

    const message = {
        title: "<:foxy_cry:1071151976504627290> **|** Sua assinatura foi cancelada!",
        description: "A sua assinatura foi cancelada, você não pode mais utilizar os benefícios relacionados ao seu plano <:foxy_cry:1071151976504627290>!"
    };
    await sendDirectMessage(customer.metadata.discord_id, message);
}

async function handleSubscriptionUpdated(event) {
    const subscription = event.data.object;
    const customer = await stripe.customers.retrieve(subscription.customer, { expand: ['subscriptions'] });
    const reason = subscription.cancellation_details.reason;

    if (reason === StripeEventsReasons.cancellationRequested) {
        const message = {
            title: "<:foxy_cry:1071151976504627290> **|** Você solicitou cancelamento da sua assinatura!",
            description: "A sua assinatura será cancelada, mas estará disponível até a data do próximo faturamento! Pensei que éramos amigos <:foxy_cry:1071151976504627290>"
        };
        await sendDirectMessage(customer.metadata.discord_id, message);
    }
}

async function handleInvoicePaymentSucceeded(event) {
    const invoice = event.data.object;
    if (invoice.billing_reason === StripeEventsReasons.subscriptionCycle) {
        const customer = await stripe.customers.retrieve(invoice.customer, { expand: ['subscriptions'] });
        const user = await database.getUser(customer.metadata.discord_id);
        const guildKey = await database.getKey(user._id);

        user.premiumExpiration = Date.now() + 2592000000;
        guildKey.expiresAt = Date.now() + 2592000000;
        await user.save();
        await guildKey.save();
    }
}

module.exports = router;