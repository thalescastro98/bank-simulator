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
        return res.status(register.status).send(register.message);
    }
    catch(err){
        console.log(err);
        return res.status(500).send({error:'Something went wrong.'});
    }
});