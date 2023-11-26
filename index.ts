import express, { Application } from 'express';
import { bot } from './utils/discord/FoxyClient';
import DatabaseConnection from './structures/DatabaseConnection';

const app: Application = express();
const database = new DatabaseConnection(bot);

require('dotenv').config();
app.use('/', require('./routes/RequestHandler'));
app.use('/', require('./routes/PaymentsHandler'));
app.use('/', require('./routes/DBLHandler'));
app.use('/memes', express.static('assets/commands/memes'));
app.use('/images', express.static('assets/commands/images'));
export { database };

app.listen(8080, () => {
    console.info('[FOXY API] Server is running on port 8080')
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[UNHANDLED REJECTION] Reason: ', reason);
});

process.on('uncaughtException', (error) => {
    console.error('[UNCAUGHT EXCEPTION] Error: ', error);
});