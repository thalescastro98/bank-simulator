import { pg } from ".";
import { requestMessage } from "../schemas";

export class UserDB{
    static registerUserDB = async (cpf:string,name:string,email:string) => {
        try{
            const verify= await pg.raw(`select cpf,email from users where cpf=? or email=? limit 1`,[cpf,email]);
            if(verify.rows[0]){
                if(cpf===verify.rows[0].cpf) return new requestMessage(409,{error:"CPF has already been registered."});
                return new requestMessage(409,{error:"Email has already been registered."});
            }
            return new requestMessage(200,(await pg.raw(`insert into users (cpf,name,email) values (?,?,?) returning *;`,[cpf,name,email])).rows[0]);
        }
        catch(err){
            console.log(err)
            return new requestMessage(500,{error:'Something went wrong.'});
        }
    }
    static userName = async (id:string) => {
        try{
            const verify= await pg.raw(`select name from users where id=? limit 1`,[id]);
            if(verify.rows[0]) return verify.rows[0].name;
            return '';
        }
        catch(err){
            console.log(err)
            return new requestMessage(500,{error:'Something went wrong.'});
        }
    }
}
