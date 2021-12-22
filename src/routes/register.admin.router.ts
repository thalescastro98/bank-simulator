import * as express from 'express';
import { admins } from '..';
import { registerAdminSchema } from '../schemas';

export const registerAdminRouter = express.Router();

registerAdminRouter.use(express.json());

registerAdminRouter.post('/', (req:any,res:any) =>{
    const body = registerAdminSchema.validate(req.body);
    if(body.error){
        res.statusCode =400;
        return res.send(body.error);
    }
    const register = admins.register(body.value.login,body.value.password);
    if(register.error) res.statusCode =409;
    return res.send(register);
});