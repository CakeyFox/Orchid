import { database } from '../index';
import { rest } from '../services/foxy/Client';
const dbl = require('@top-gg/sdk');
const router = require('express').Router();

const webhook = new dbl.Webhook(process.env.DBL_TOKEN);

router.post('/dblwebhook', webhook.listener(async (vote) => {
    const user = await database.getUser(vote.user);
    if (!user) return;

    try {
        setTimeout(async () => {
            rest.sendDirectMessage(vote.user, {
                embeds: [{
                        title: "Obrigada por votar!<:foxy_cake:866084383843549204>",
                        description: "Você sabia que votando você me ajuda a crescer? <:foxy_yay:1070906796274888795>\n\nE como recompensa você recebeu **1500 cakes**!\n\nVocê pode votar novamente em 12 horas!",
                        color: 0xe7385d,
                        thumbnail: {
                            url: "https://cdn.discordapp.com/attachments/1078322762550083736/1161659519982637177/27_Sem_Titulo_20210215123555.png?ex=65391abc&is=6526a5bc&hm=38eafff04f0bea7a3d9f0fc154ac24875878664cf488c43ab38cf900cab48269&"
                        },
                        footer: {
                            "text": "Obrigada por votar, você é incrível!"
                        }
                    }]
            });
        }, 500);
    } catch (err) { }

    user.userCakes.balance += 1500;
    user.userTransactions.push({
        from: "Foxy",
        to: vote.user,
        quantity: 1500,
        date: new Date(),
        type: "voteReward"
    });
    
    await user.save();
}));

module.exports = router;