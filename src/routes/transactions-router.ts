import * as express from 'express';
import { transactionsSchema,getTransactionsSchema, errorHandling } from '../schemas';
import { getTransactionsService,transactionsService } from '../service';

export const transactionsRouter = express.Router();

transactionsRouter.get('/', async (req:any,res:any) =>{
    const query=getTransactionsSchema.validate(req.query);
    if(query.error) return res.status(400).send(query.error);    
    try {
        const transactions = await getTransactionsService(query.value.id);
        return res.status(200).send(transactions);
    } 
    catch (err:any) {
        return errorHandling(res,err);
    }
});

transactionsRouter.use(express.json());

transactionsRouter.post('/', async (req:any,res:any) =>{
    const body=transactionsSchema.validate(req.body);
    if(body.error) return res.status(400).send(body.error);
    try {
        const transaction = await transactionsService(body.value.type,body.value.fromId,body.value.amount,body.value.toId);
        return res.status(200).send(transaction);
    }
    catch (err:any) {
        return errorHandling(res,err);
    }
});
