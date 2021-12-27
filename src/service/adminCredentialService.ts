import { AdminDB } from "../database";

export const adminCredentialService = (login:string,password:string) => {
    return AdminDB.verifyAdminDB(login,password);
}