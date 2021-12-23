import * as express from 'express';
import { transactions,users } from '..';
import { transactionsSchema,getTransictionsSchema } from '../schemas';

export const transactionsRouter = express.Router();

transactionsRouter.get('/', (req:any,res:any) =>{
    const query=getTransictionsSchema.validate(req.query);
    if(query.error){
        res.statusCode=400;
        return res.send(query.error);
    }
    if(query.value.id && users.userName(query.value.id)===''){
        res.statusCode=404;
        return res.send({error:'This ID is not registered'});
    }
    return res.send(transactions.transactions(req.query.id));
});

transactionsRouter.use(express.json());

transactionsRouter.post('/', (req:any,res:any) =>{
    const body=transactionsSchema.validate(req.body);
    if(body.error) {
        res.statusCode = 400;
        return res.send(body.error);
    }
    const nameFrom=users.userName(body.value.id)
    if(nameFrom===''){
        res.statusCode=404;
        return res.send({error:'This ID is not registered'});
    }

    if(body.value.type==='deposit'){
        return res.send(transactions.newDeposit(body.value.id,nameFrom,body.value.amount));
    }

    if(body.value.type==='withdraw'){
        const withdraw = transactions.newWithdraw(body.value.id,nameFrom,body.value.amount);
        if('error' in withdraw) res.statusCode=400;
        return res.send(withdraw);
    }

    if(body.value.type='transfer' && body.value.toId){
        const nameTo=users.userName(body.value.toId)
        if(nameTo===''){
            res.statusCode=404;
            return res.send({error:'This ID is not registered'});
        }
        const transfer = transactions.newTransfer(body.value.id,nameFrom,body.value.amount,body.value.toId,nameTo);
        if(transfer.error) res.statusCode=400;
        return res.send(transfer);
    }

    res.statusCode=500;
    return res.send({error:'Wrong set of informations.'});
});
