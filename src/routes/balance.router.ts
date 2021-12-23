import * as express from 'express';
import { users,transactions } from '..';
import { getBalanceSchema } from '../schemas';

export const balanceRouter = express.Router();

balanceRouter.get('/:id', (req:any,res:any) =>{
    const params= getBalanceSchema.validate(req.params);
    if(params.error){
        res.statusCode=400;
        return res.send(params.error);
    }
    const name=users.userName(params.value.id)
    if(name===''){
        res.statusCode=404;
        return res.send({error:'This ID is not registered'});
    }
    return res.send({name:name,balance:transactions.balanceCalculation(params.value.id)});
});