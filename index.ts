import express, { Application } from 'express';

const app: Application = express();
require('dotenv').config();
app.use('/', require('./routes/RequestHandler'));
app.use('/memes', express.static('./assets/commands/images/memes'));
app.use('/images', express.static('./assets/commands/images'));

app.listen(8080, () => {
    console.info('[FOXY API] Server is running on port 8080')
});