import { createBot, Intents, startBot, Bot } from 'discordeno';

require('dotenv').config();
const bot = createBot({
    token: process.env.FOXY_TOKEN,
    intents: 0 as Intents
}) as Bot;

startBot(bot);

export { bot };