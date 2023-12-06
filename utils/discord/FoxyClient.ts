import { createBot, Intents, startBot, Bot, ActivityTypes } from 'discordeno';
import { FoxyRestManager } from '../../structures/RestManager';

require('dotenv').config();
const bot = createBot({
    token: process.env.FOXY_TOKEN,
    intents: 0 as Intents
}) as Bot;
const rest = new FoxyRestManager(bot);

startBot(bot);

export { bot, rest };