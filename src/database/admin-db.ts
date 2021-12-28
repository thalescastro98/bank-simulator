import { pg } from ".";
import { ErrorMessage } from "../schemas";

export class AdminDB{
    static registerAdminDB = async (login:string,password:string) => {
        const verify= await pg.raw(`select login from admins where login=? limit 1`,[login]);
        if(verify.rows[0]){
            throw new ErrorMessage(409,{error:"Login has already been registered."});
        }
        const data = await pg.raw(`insert into admins (login,password) values (?,?) returning *;`,[login,password])
        return (data).rows[0];
    }
    static verifyAdminDB = async (login:string,password:string) => {
        const verify = await pg.raw(`select login,password from admins where login=? and password=? limit 1`,[login,password]);
        if(verify.rows[0]) return true;
        throw new ErrorMessage(401,{error:'Access Denied.'});
    }
}
