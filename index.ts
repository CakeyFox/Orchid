import express, { Application } from 'express';
import { bot } from './services/foxy/Client';
import DatabaseConnection from './services/foxy/Database';
import { logger } from './utils/logger';

const app: Application = express();
const database = new DatabaseConnection(bot);
app.use(express.json());

require('dotenv').config();

/* Route Handlers */
app.use('/', require('./routes/RequestHandler'));
// app.use('/', require('./routes/PaymentsHandler'));
app.use('/', require('./routes/foxy/DBLHandler'));
app.use('/', require('./routes/RSOHandler'));

/* Static File Handler */
app.use('/assets', express.static('assets/'));

app.listen(process.env.PORT, () => {
    logger.info(`[READY] - Server is running at https://localhost:${process.env.PORT}`);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('[UNHANDLED REJECTION] Reason: ', reason);
});

process.on('uncaughtException', (error) => {
    logger.criticalError('[UNCAUGHT EXCEPTION] Error: ', error);
});

export { database };