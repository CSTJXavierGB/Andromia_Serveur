import cors from 'cors';
import express from 'express';

import database from './core/database.js';
import errors from './middlewares/errors.js';

import tokensRoutes from './routes/tokens.routes.js';
import limitRoute from './routes/limits.routes.js';
import alliesRoutes from './routes/allies.routes.js'

const app = express();

database();

app.use(cors());
app.use(express.json());

app.get('/status', (req, res) => { res.status(200).end(); });
app.head('/status', (req, res) => { res.status(200).end(); });

app.use('/tokens', tokensRoutes);
app.use('/allies', alliesRoutes);

app.use(limitRoute);
app.use(errors);

export default app;