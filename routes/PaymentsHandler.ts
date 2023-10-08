import bodyParser from 'body-parser';
import { products } from '../structures/json/products.json';
import { database } from '..';
import { rest } from '../utils/discord/FoxyClient';

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
                    const user = await database.getUser(expandedSession.custom_fields[0].text.value);
                    user.premiumType = product().pType;
                    user.premiumDate = Date.now();
                    user.transactions.push({
                        type: 'premiumPerk',
                        amount: product().cakes,
                        timestamp: Date.now()
                    });
                    user.balance += product().cakes;
                    user.premium = true;
                    user.save();
                    try {
                        rest.sendDirectMessage(expandedSession.custom_fields[0].text.value, {
                            embeds: [{
                                title: '<:foxy_yay:1070906796274888795> **|** Obrigada por assinar o premium!',
                                description: `Obrigada por assinar o plano ${product().name}! Você recebeu **${product().cakes} Cakes!** e outros benefícios, obrigada por me ajudar a ficar online!`
                            }]
                        });
                    } catch(err) { }
                    break;
                }

                case 'one-time': {
                    const user = await database.getUser(expandedSession.custom_fields[0].text.value);  
                    user.balance += product().cakes;
                    user.transactions.push({
                        type: 'bought',
                        amount: product().cakes,
                        timestamp: Date.now()
                    });
                    user.save();
                    try {
                        rest.sendDirectMessage(expandedSession.custom_fields[0].text.value, {
                                embeds: [{
                                    title: '<:foxy_yay:1070906796274888795> **|** Obrigada por comprar cakes!',
                                    description: `Obrigada por comprar ${product().name}! Agora você pode utilizar na minha lojinha ou enviar para outras pessoas _ou até ficar em um rank alto rsrsrs_, obrigada por me ajudar a ficar online!`
                                }]
                        });
                    } catch(err) { }
                    break;
                }
            }

            break;
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            const customer = await stripe.customers.retrieve(subscription.customer, {
                expand: ['subscriptions']
            });

            console.log(customer);
            const user = await database.getUser(customer.metadata.discord_id);
            user.premiumType = null;
            user.premiumDate = null;
            user.premium = false;
            user.save();
            rest.sendDirectMessage(customer.metadata.discord_id, {
                embeds: [{
                    title: "<:foxy_cry:1071151976504627290> **|** Seu premium foi cancelado!",
                    description: "Seu premium foi cancelado, pensei que éramos amigos <:foxy_cry:1071151976504627290>!"
                }]
            });
            break;
        }
    }
});

module.exports = router;