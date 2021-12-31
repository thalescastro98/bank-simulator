import * as express from 'express';
import { transactionsSchema, getTransactionsSchema, errorHandling, joiHandling, ErrorMessage } from '../schemas';
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
    if (body.toId && body.type !== 'transfer') throw new ErrorMessage(400, { error: 'toId must be null for this kind of operation.' });
    if (body.type === 'transfer' && typeof body.toId === 'undefined') throw new ErrorMessage(400, { error: 'Missing information.' });
    if (parseFloat(body.amount) === 0) throw new ErrorMessage(400, { error: 'Transactions with R$0.00 are not allowed' });
    const transaction = await transactionsService(body.type, body.fromId, body.amount, body.toId);
    return res.status(200).send(transaction);
  } catch (err: any) {
    return errorHandling(res, err);
  }
});
