import { createBot, Intents, startBot, Bot, ActivityTypes } from 'discordeno';
import { RestManager } from './RestManager';
import { logger } from '../../utils/logger';

require('dotenv').config();
const bot = createBot({
    token: process.env.FOXY_TOKEN,
    intents: 0 as Intents
}) as Bot;
const rest = new RestManager(bot);

bot.events.ready = async (_, payload) => {
    logger.info("[FOXY] - Connected to Discord Gateway");
    bot.helpers.editBotStatus({
        activities: [{
            name: "Precisa de ajuda? Entre no meu servidor de suporte foxybot.win/br/support",
            type: ActivityTypes.Game,
            createdAt: Date.now()
        }],
        status: "online"
    })
}


startBot(bot);

export { bot, rest };