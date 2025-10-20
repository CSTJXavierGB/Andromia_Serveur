import cors from 'cors';
import express from 'express';

import database from './core/database.js';
import errors from './middlewares/errors.js';

import accountRoutes from './routes/accounts.routes.js';
import sessionsRoutes from './routes/sessions.routes.js';
import tokensRoutes from './routes/tokens.routes.js';
import expensesRoutes from './routes/expenses.routes.js';
import securesRoutes from './routes/secures.routes.js';
import limitRoute from './routes/limits.routes.js';

const app = express();

database();

app.use(cors());
app.use(express.json());

app.get('/status', (req, res) => { res.status(200).end(); });
app.head('/status', (req, res) => { res.status(200).end(); });

app.use('/accounts', accountRoutes);
app.use('/sessions', sessionsRoutes);
app.use('/tokens', tokensRoutes);
app.use('/expenses', expensesRoutes);
app.use('/secures', securesRoutes);

app.use(limitRoute);
app.use(errors);

export default app;