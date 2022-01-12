import { getConnection } from '.';
import { ErrorMessage } from '../schemas';

export class AdminDB {
  static registerAdminDB = async (login: string, password: string) => {
    const verify = await getConnection().raw('SELECT login FROM admins WHERE login=? LIMIT 1', [login]);
    if (verify.rows[0]) {
      throw new ErrorMessage(409, { error: 'Login has already been registered.' });
    }
    const data = await getConnection().raw('INSERT INTO admins (login,password) VALUES (?,?) RETURNING *;', [login, password]);
    return data.rows[0];
  };
  static verifyAdminDB = async (login: string, password: string) => {
    const verify = await getConnection().raw('SELECT login,password FROM admins WHERE login=? AND password=? LIMIT 1', [login, password]);
    if (verify.rows[0]) return true;
    throw new ErrorMessage(401, { error: 'Access Denied.' });
  };
}
