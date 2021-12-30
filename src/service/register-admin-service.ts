import { AdminDB } from '../database';

export const registerAdminService = (login: string, password: string) => {
  return AdminDB.registerAdminDB(login, password);
};
