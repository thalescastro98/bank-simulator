import * as express from 'express';
import { authenticator } from './middlewares';
import { registerAdminRouter, registerRouter, transactionsRouter, balanceRouter } from './routes';

export const buildApp = () => {
  const app = express();

  app.use(authenticator);

  app.use(express.json());

  app.get('/', async (req: any, res: any) => {
    res.send('Working');
  });

  app.use('/register', registerRouter);

  app.use('/transactions', transactionsRouter);

  app.use('/balance', balanceRouter);

  app.use('/register/admin', registerAdminRouter);
  return app;
};
