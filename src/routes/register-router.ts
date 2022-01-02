import * as express from 'express';
import { errorHandling, joiHandling, registerUserSchema } from '../schemas';
import { registerUserService } from '../service';

export const registerRouter = express.Router();

registerRouter.post('/', async (req: any, res: any) => {
  try {
    const body = joiHandling(registerUserSchema, req.body);
    const requestResult = await registerUserService(body.cpf, body.name, body.email);
    return res.status(200).send(requestResult);
  } catch (err: any) {
    return errorHandling(res, err);
  }
});
