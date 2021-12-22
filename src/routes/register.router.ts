import * as express from 'express';
import { users } from '..';
import { registerUserSchema } from '../schemas';

export const registerRouter = express.Router();

registerRouter.use(express.json());

registerRouter.post('/', (req:any,res:any) =>{
    const body = registerUserSchema.validate(req.body);
    if(body.error) {
        res.statusCode = 400;
        return res.send(body.error);
    }

    const registration = users.register(body.value.cpf,body.value.name,body.value.email);
    if('error' in registration) res.statusCode = 409;

    return res.send(registration);
});