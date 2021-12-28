import * as express from 'express';
import { getBalanceSchema } from '../schemas';
import { balanceService } from '../service';

export const balanceRouter = express.Router();

balanceRouter.get('/:id', async (req:any,res:any) =>{
    const params= getBalanceSchema.validate(req.params);
    if(params.error) return res.status(400).send(params.error);
    try{
        const balanceRequest=await balanceService(params.value.id)
        return res.status(200).send(balanceRequest);
    }
    catch(err:any){
        console.log(err);
        return res.status( err.status ? err.status :500).send( err.message ? err.message : {error:'Something went wrong.'});
    }
});