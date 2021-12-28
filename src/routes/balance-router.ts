import * as express from 'express';
import { errorHandling, getBalanceSchema, joiHandling } from '../schemas';
import { balanceService } from '../service';

export const balanceRouter = express.Router();

balanceRouter.get('/:id', async (req:any,res:any) =>{
    try{
        const params = joiHandling(getBalanceSchema,req.params);
        const balanceRequest=await balanceService(params.id)
        return res.status(200).send(balanceRequest);
    }
    catch(err:any){
        return errorHandling(res,err);
    }
});