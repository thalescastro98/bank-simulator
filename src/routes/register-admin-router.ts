import * as express from 'express';
import { errorHandling, joiHandling, registerAdminSchema } from '../schemas';
import { registerAdminService } from '../service';

export const registerAdminRouter = express.Router();

registerAdminRouter.use(express.json());

registerAdminRouter.post('/', async (req: any, res: any) => {
  try {
    const body = joiHandling(registerAdminSchema, req.body);
    const register = await registerAdminService(body.login, body.password);
    return res.status(200).send(register);
  } catch (err: any) {
    return errorHandling(res, err);
  }
});
