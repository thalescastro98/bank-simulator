import { pg } from ".";
import { requestMessage } from "../schemas";

export class UserDB{
    static registerUserDB = async (cpf:string,name:string,email:string) => {
        const verify= await pg.raw(`select cpf,email from users where cpf=? or email=? limit 1`,[cpf,email]);
        if(verify.rows.length){
            if(cpf===verify.rows[0].cpf) throw new requestMessage(409,{error:"CPF has already been registered."});
            throw new requestMessage(409,{error:"Email has already been registered."});
        }
        const response = await pg.raw(`insert into users (cpf,name,email) values (?,?,?) returning *;`,[cpf,name,email]);
        return response.rows[0];
    }
    static userName = async (id:string) => {
        const verify= await pg.raw(`select name from users where id=? limit 1`,[id]);
        if(verify.rows[0]) return verify.rows[0].name;
        throw new requestMessage(404,{error:'This ID is not registered.'});
    }
}
