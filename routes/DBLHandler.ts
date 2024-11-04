import { Webhook } from '@top-gg/sdk';
import express from 'express';
import { database } from '..';
import { RestManager } from '../services/foxy/RestManager';
import { logger } from '../utils/logger';

export default class DBLHandler {
    private router: express.Router;
    private webhookListener: Webhook;
    private rest: RestManager;

    constructor() {
        this.router = express.Router();
        this.webhookListener = new Webhook(process.env.DBL_TOKEN);
        this.rest = new RestManager();
        this.init();
    }

    init() {
        this.router.post('/dblwebhook', this.webhookListener.listener(this.webhookReceiver.bind(this)));
    }

    getRouter() {
        return this.router;
    }

    async webhookReceiver(vote) {
        const user = await database.getUser(vote.user);
        if (!user) return;

        try {
            setTimeout(async () => {
                await this.rest.sendDirectMessage(vote.user, {
                    embeds: [{
                        title: "Obrigada por votar!<:foxy_cake:866084383843549204>",
                        description: "Você sabia que votando você me ajuda a crescer? <:foxy_yay:1070906796274888795>\n\nE como recompensa você recebeu **1500 cakes**!\n\nVocê pode votar novamente em 12 horas!",
                        color: 0xe7385d,
                        thumbnail: {
                            url: "https://cdn.discordapp.com/attachments/1078322762550083736/1161659519982637177/27_Sem_Titulo_20210215123555.png?ex=65391abc&is=6526a5bc&hm=38eafff04f0bea7a3d9f0fc154ac24875878664cf488c43ab38cf900cab48269&"
                        },
                        footer: {
                            text: "Obrigada por votar, você é incrível!"
                        }
                    }]
                });
            }, 500);
        } catch (err) {
            console.error("Erro ao enviar mensagem de agradecimento:", err);
        }

        user.userCakes.balance += 1500;
        user.userTransactions.push({
            from: "Foxy",
            to: vote.user,
            quantity: 1500,
            date: new Date(),
            type: "voteReward"
        });

        user.lastVote = new Date();
        user.voteCount = (user.voteCount || 0) + 1;
        user.notifiedForVote = false;

        await user.save();
    }

    async checkVoteNotifications() {
        const usersToNotify = await database.getExpiredVotes();
        usersToNotify.forEach(async (user) => {
            try {
                await this.rest.sendDirectMessage(user._id, {
                    embeds: [{
                        title: "Vote na Foxy! <:foxy_cake:866084383843549204>",
                        description: "O-oi! Você já pode votar novamente em mim! \n\nLembrando que você pode votar a cada 12 horas, e a cada voto você ganha **1500 cakes**! Sem falar que isso também me ajuda a crescer :3 <:foxy_yay:1070906796274888795>",
                        color: 0xe7385d,
                        thumbnail: {
                            url: "https://cdn.discordapp.com/attachments/1078322762550083736/1161659519982637177/27_Sem_Titulo_20210215123555.png?ex=65391abc&is=6526a5bc&hm=38eafff04f0bea7a3d9f0fc154ac24875878664cf488c43ab38cf900cab48269&"
                        },
                        footer: { text: "Vote para me ajudar a crescer!" }
                    }],
                    components: [{
                        type: 1,
                        components: [{
                            type: 2,
                            style: 5,
                            label: "Votar",
                            url: "https://top.gg/bot/1006520438865801296/vote",
                            emoji: { id: "866084383843549204"}
                        }]
                    }]
                });
                user.notifiedForVote = true;
                await user.save();
            } catch (err) {
                console.error(`Erro ao enviar notificação para o usuário ${user.id}:`, err);
            }
        });
    }
}

setInterval(() => {
    const dblHandler = new DBLHandler();
    logger.info("Checking vote notifications...");
    dblHandler.checkVoteNotifications();
}, 1000 * 60 * 60 * 1); // 1 hour