import * as express from 'express';
import { getBalanceSchema } from '../schemas';
import { balanceService } from '../service/balanceService';

export const balanceRouter = express.Router();

balanceRouter.get('/:id', async (req:any,res:any) =>{
    const params= getBalanceSchema.validate(req.params);
    if(params.error){
        res.statusCode=400;
        return res.send(params.error);
    }

    try{
        const balanceRequest=await balanceService(params.value.id)
        return res.status(balanceRequest.status).send(balanceRequest.message);
    }
    catch(err){
        console.log(err);
        return res.status(500).send({error:'Something went wrong.'});
    }
});