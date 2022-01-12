import * as auth from 'basic-auth';
import { credentialsSchema, errorHandling, ErrorMessage, joiHandling } from '../schemas';
import { adminCredentialService } from '../service';

export const authenticator = async (req: any, res: any, next: any) => {
  try {
    const credentials = joiHandling(credentialsSchema, auth(req));
    if (typeof auth(req) === 'undefined') throw new ErrorMessage(401, { error: 'Access Denied.' });
    const verifyCredentials = await adminCredentialService(credentials.name, credentials.pass);
    if (verifyCredentials) {
      console.log(`Access successful as ${credentials.name}`);
      next();
    } else return res.status(500).send({ error: 'Something went wrong.' });
  } catch (err: any) {
    return errorHandling(res, err);
  }
};
