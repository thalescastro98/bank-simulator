import * as auth from 'basic-auth';
import { credentialsSchema, errorHandling, joiHandling } from '../schemas';
import { adminCredentialService } from '../service';

export const authenticator = async (req: any, res: any, next: any) => {
  try {
    const credentials = joiHandling(credentialsSchema, auth(req));
    const verifyCredentials = await adminCredentialService(credentials.name, credentials.pass);
    if (verifyCredentials) {
      console.log(`Access successful as ${credentials.name}`);
      next();
    } else return res.status(500).send({ error: 'Something went wrong.' });
  } catch (err: any) {
    return errorHandling(res, err);
  }
};
