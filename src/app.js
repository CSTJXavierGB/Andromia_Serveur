import cors from 'cors';
import express from 'express';

import database from './core/database.js';
import errors from './middlewares/errors.js';

import alliesRoutes from './routes/allies.routes.js'
import explorersrRoutes from './routes/explorer.routes.js'
import sessionsRoutes from './routes/sessions.routes.js'
const app = express();

database();

app.use(cors());
app.use(express.json());

app.get('/status', (req, res) => { res.status(200).end(); });
app.head('/status', (req, res) => { res.status(200).end(); });

app.use('/allies', alliesRoutes);
app.use('/explorers', explorersrRoutes);
app.use('/sessions', sessionsRoutes);


app.use(errors);

export default app;