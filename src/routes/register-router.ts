import * as express from 'express';
import { users } from '..';
import { registerUserSchema } from '../schemas';
import { registerUserService } from '../service';

export const registerRouter = express.Router();

registerRouter.use(express.json());

registerRouter.post('/', async (req:any,res:any) =>{
    const body = registerUserSchema.validate(req.body);
    if(body.error) {
        res.statusCode = 400;
        return res.send(body.error);
    }
    try{
        const requestResult = await registerUserService(body.value.cpf,body.value.name,body.value.email)
        return res.status(requestResult.status).send(requestResult.message);
    }
    catch(err){
        console.log(err);
        return res.status(500).send({error:'Something went wrong.'});
    }
    // const registration = users.register(body.value.cpf,body.value.name,body.value.email);
    // if('error' in registration) res.statusCode = 409;

    // return res.send(registration);
});