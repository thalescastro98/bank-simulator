import { pg } from '.';
import { ErrorMessage } from '../schemas';

export class UserDB {
  static registerUserDB = async (cpf: string, name: string, email: string) => {
    const verify = await pg.raw('SELECT cpf,email FROM users WHERE cpf=? OR email=? LIMIT 1', [cpf, email]);
    if (verify.rows.length) {
      if (cpf === verify.rows[0].cpf) throw new ErrorMessage(409, { error: 'CPF has already been registered.' });
      throw new ErrorMessage(409, { error: 'Email has already been registered.' });
    }
    const response = await pg.raw('INSERT INTO users (cpf,name,email) VALUES (?,?,?) RETURNING *;', [cpf, name, email]);
    return response.rows[0];
  };
  static userName = async (id: string) => {
    const verify = await pg.raw('SELECT name FROM users WHERE id=? LIMIT 1', [id]);
    if (verify.rows[0]) return verify.rows[0].name;
    throw new ErrorMessage(404, { error: 'This ID is not registered.' });
  };
}
