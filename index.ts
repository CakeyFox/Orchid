import express, { Application } from 'express';

const app: Application = express();
require('dotenv').config();
app.use('/', require('./routes/RequestHandler'));
app.listen(8080, () => {
    console.info('[FOXY API] Server is running on port 8080')
});