import * as express from 'express';
import { errorHandling, registerAdminSchema } from '../schemas';
import { registerAdminService } from '../service';

export const registerAdminRouter = express.Router();

registerAdminRouter.use(express.json());

registerAdminRouter.post('/', async (req:any,res:any) =>{
    const body = registerAdminSchema.validate(req.body);
    if(body.error) return res.status(400).send(body.error);
    try{
        const register = await registerAdminService(body.value.login,body.value.password);
        return res.status(200).send(register);
    }
    catch(err:any){
        return errorHandling(res,err);
    }
});