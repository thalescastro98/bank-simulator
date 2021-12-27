import * as express from 'express';
import { transactions,users } from '..';
import { transactionsSchema,getTransactionsSchema } from '../schemas';
import { transactionsService } from '../service/transactionsService';
import { getTransactionsService } from '../service/getTransactionsService';

export const transactionsRouter = express.Router();

transactionsRouter.get('/', async (req:any,res:any) =>{
    const query=getTransactionsSchema.validate(req.query);
    if(query.error){
        res.statusCode=400;
        return res.send(query.error);
    }
    
    try {
        const transactions = await getTransactionsService(query.value.id);
        return res.status(transactions.status).send(transactions.message);
    } 
    catch (err) {
        console.log(err);
        return res.status(500).send({error:'Something went wrong.'});
    }
});

transactionsRouter.use(express.json());

transactionsRouter.post('/', async (req:any,res:any) =>{
    const body=transactionsSchema.validate(req.body);
    if(body.error) {
        res.statusCode = 400;
        return res.send(body.error);
    }

    try {
        const transaction = await transactionsService(body.value.type,body.value.fromId,body.value.amount,body.value.toId);
        return res.status(transaction.status).send(transaction.message);
    } catch (err) {
        console.log(err);
        return res.status(500).send({error:'Something went wrong.'});
    }
});
