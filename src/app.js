import cors from 'cors';
import express from 'express';

import database from './core/database.js';
import errors from './middlewares/errors.js';

import alliesRoutes from './routes/allies.routes.js';
import explorerRoutes from './routes/explorer.routes.js';
import explorationRoutes from './routes/explorations.routes.js'
import sessionsRoutes from './routes/sessions.routes.js';
import tokensRoutes from './routes/tokens.routes.js';
import listingsRoutes from './routes/listings.routes.js';
import explorerListingsRoutes from './routes/explorer.listings.routes.js';
import cronRoutes from './routes/cron.routes.js';
import methodOverride from 'method-override';

const app = express();

database();


app.use(cors());
app.use(express.json());
app.use(methodOverride('X-HTTP-Method-Override'))





app.get('/status', (req, res) => {
    res.status(200).end();
});
app.head('/status', (req, res) => {
    res.status(200).end();
});

app.use('/allies', alliesRoutes);
app.use('/explorers', explorerRoutes);
app.use(explorationRoutes);
app.use('/sessions', sessionsRoutes);
app.use('/listings', listingsRoutes);
app.use('/tokens', tokensRoutes);
app.use('/explorers', explorerListingsRoutes);
app.use('/cron', cronRoutes);

app.use(errors);

export default app;
