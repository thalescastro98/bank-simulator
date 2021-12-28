import { pg } from ".";
import { requestMessage } from "../schemas";

export class AdminDB{
    static registerAdminDB = async (login:string,password:string) => {
        try{
            const verify= await pg.raw(`select login from admins where login=? limit 1`,[login]);
            if(verify.rows[0]){
                return new requestMessage(409,{error:"Login has already been registered."});
            }
            return new requestMessage(200,(await pg.raw(`insert into admins (login,password) values (?,?) returning *;`,[login,password])).rows[0]);
        }
        catch(err:any){
            console.log(err);
            return new requestMessage(500,{error:'Something went wrong.'});
        }
    }
    static verifyAdminDB = async (login:string,password:string) => {
        try{
            const verify = await pg.raw(`select login,password from admins where login=? and password=? limit 1`,[login,password]);
            if(verify.rows[0]) return new requestMessage(200,`Access successful as ${login}`);
            return new requestMessage(401,{error:'Access Denied.'});
        }
        catch(err:any){
            console.log(err);
            return new requestMessage(500,{error:'Something went wrong.'});
        }
    }
}
