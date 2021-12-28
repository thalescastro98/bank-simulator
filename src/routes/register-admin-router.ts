import * as express from 'express';
import { registerAdminSchema } from '../schemas';
import { registerAdminService } from '../service';

export const registerAdminRouter = express.Router();

registerAdminRouter.use(express.json());

registerAdminRouter.post('/', async (req:any,res:any) =>{
    const body = registerAdminSchema.validate(req.body);
    if(body.error){
        res.statusCode =400;
        return res.send(body.error);
    }
    try{
        const register = await registerAdminService(body.value.login,body.value.password);
        return res.status(200).send(register);
    }
    catch(err:any){
        console.log(err);
        return res.status( err.status ? err.status :500).send( err.message ? err.message : {error:'Something went wrong.'});
    }
});