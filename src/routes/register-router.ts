import * as express from 'express';
import { registerUserSchema } from '../schemas';
import { registerUserService } from '../service';

export const registerRouter = express.Router();

registerRouter.use(express.json());

registerRouter.post('/', async (req:any,res:any) =>{
    const body = registerUserSchema.validate(req.body);
    if(body.error) return res.status(400).send(body.error);
    try{
        const requestResult = await registerUserService(body.value.cpf,body.value.name,body.value.email)
        return res.status(200).send(requestResult);
    }
    catch(err:any){
        console.log(err);
        return res.status( err.status ? err.status :500).send( err.message ? err.message : {error:'Something went wrong.'});
    }
});