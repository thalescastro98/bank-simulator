import * as express from 'express';
import { transactionsSchema, getTransactionsSchema, errorHandling, joiHandling } from '../schemas';
import { getTransactionsService, transactionsService } from '../service';

export const transactionsRouter = express.Router();

transactionsRouter.get('/', async (req: any, res: any) => {
  try {
    const query = joiHandling(getTransactionsSchema, req.query);
    const transactions = await getTransactionsService(query.id);
    return res.status(200).send(transactions);
  } catch (err: any) {
    return errorHandling(res, err);
  }
});

transactionsRouter.use(express.json());

transactionsRouter.post('/', async (req: any, res: any) => {
  try {
    const body = joiHandling(transactionsSchema, req.body);
    const transaction = await transactionsService(body.type, body.fromId, body.amount, body.toId);
    return res.status(200).send(transaction);
  } catch (err: any) {
    return errorHandling(res, err);
  }
});
