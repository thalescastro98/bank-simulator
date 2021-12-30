import { UserDB } from '../database';

export const registerUserService = (cpf: string, name: string, email: string) => {
  return UserDB.registerUserDB(cpf, name, email);
};
