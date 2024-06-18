import express, { Application } from 'express';
import DatabaseConnection from './services/foxy/database/DatabaseManager';
import { logger } from './utils/logger';
import { RestManager } from './services/foxy/RestManager';

const app: Application = express();
const database = new DatabaseConnection();
const rest = new RestManager();

app.use(express.json());

require('dotenv').config();

/* Route Handlers */
app.use('/', require('./routes/RequestHandler'));
app.use('/', require('./routes/RSOHandler'));
app.use('/', require('./routes/DBLHandler'));
app.use('/', require('./routes/PaymentsHandler'));

/* Static Files */
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

export { database, rest };