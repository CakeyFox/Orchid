import bodyParser from 'body-parser';
import { products } from '../structures/json/products.json';
import { database } from '..';
import { rest } from '../utils/discord/FoxyClient';

const stripe = require('stripe')(process.env.STRIPE_KEY);

const router = require('express').Router();

router.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const event = JSON.parse(req.body.toString());
    const sig = req.headers['stripe-signature'];
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
                    const date = new Date();
                    let guildPremium;
                    date.setMonth(date.getMonth() + 1);

                    if (product().pType !== 1) {
                        guildPremium = await database.registerKey(expandedSession.custom_fields[0].text.value, date, product().pType);
                        console.log(product().pType)
                    }
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
                        switch (product().pType) {
                            case 1: {
                                rest.sendDirectMessage(expandedSession.custom_fields[0].text.value, {
                                    embeds: [{
                                        title: "Obrigada por me ajudar a ficar online, yay!",
                                        description: `Muito obrigada por comprar **${product().name}**! Você não sabe o quanto isso me ajuda (a comprar comida) e me manter online, como forma de dizer que você é uma pessoa fofa sem dizer de forma direta, você ganhou **${product().cakes.toLocaleString('pt-BR')} Cakes**! Muito obrigada! <:foxy_pray:1084184966998536303>`,
                                        color: 0xe7385d,
                                        image: {
                                            url: "https://cdn.discordapp.com/attachments/1078322762550083736/1160621235525386240/tier1.png?ex=653553c1&is=6522dec1&hm=551a4cb84dd192c574913931f8c8da883c14c7cdecfbada03677d230b9f042cc&"
                                        },
                                        footer: {
                                            text: "Obrigada por me ajudar a ficar online!"
                                        }
                                    }]
                                });

                                break;
                            }

                            case 2: {
                                rest.sendDirectMessage(expandedSession.custom_fields[0].text.value, {
                                    embeds: [{
                                        title: "Obrigada por me ajudar a ficar online, yay!",
                                        description: `Yay! Obriada por comprar o **${product().name}**! Como forma de gratidão por me ajudar a comprar mais bolo, você ganhou **${product().cakes} Cakes. Muito obrigada seu fofo(a)! Opa! Já ia me esquecendo! Aqui está a key de ativação para você ativar os recursos premium no seu servidor! \`\`\`${guildPremium.key}\`\`\``,
                                        color: 0xe7385d,
                                        image: {
                                            url: "https://cdn.discordapp.com/attachments/1078322762550083736/1160621235751895050/tier2.png?ex=653553c1&is=6522dec1&hm=a930bd666db85c864c7773f57d40d68a795e02e9fae0cc5e0d44f382f5d71390&"
                                        },
                                        footer: {
                                            text: "Obrigada por me ajudar a ficar online!"
                                        }
                                    }]
                                });

                                break;
                            }

                            case 3: {
                                rest.sendDirectMessage(expandedSession.custom_fields[0].text.value, {
                                    embeds: [{
                                        title: "Obrigada por me ajudar a ficar online, yay!",
                                        description: `Você... Comprou ${product().name}! só para me ajudar? Não tenho como descrever o quando você me ajudou com isso... Como forma de gratidão, que ainda sim não se compara a essa ajuda, você recebeu **${product().cakes} Cakes**. Muito obrigada, de verdade <:foxy_cry:1071151976504627290>! Opa! Já ia me esquecendo! Aqui está a key de ativação para você ativar os recursos premium no seu servidor! \`\`\`${guildPremium.key}\`\`\``,
                                        color: 0xe7385d,
                                        image: {
                                            url: "https://cdn.discordapp.com/attachments/1078322762550083736/1160621236003549184/tier3.png?ex=653553c1&is=6522dec1&hm=9c05baa69551f32f03b2265d85c371e2faebf03c8043964000b131fb564a4667&"
                                        },
                                        footer: {
                                            text: "Obrigada por me ajudar a ficar online!"
                                        }
                                    }]
                                });

                                break;
                            }
                        }
                    } catch (err) { }
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
                                description: `Obrigada por comprar **${product().name}**! Agora você pode utilizar na minha lojinha ou enviar para outras pessoas _ou até ficar em um rank alto rs_, obrigada por me ajudar a ficar online! <:foxy_yay:1070906796274888795>`,
                                color: 0xe7385d,
                                footer: {
                                    text: "Obrigada por me ajudar a ficar online!"
                                }
                            }]
                        });
                    } catch (err) { }
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