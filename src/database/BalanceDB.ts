import { Knex } from "knex";
import { pg } from ".";
import { requestMessage } from "../schemas";

export class BalanceDB{
    static getUserBalance = async (id:string,trx?:Knex.Transaction<any, any[]>) => {
        try{
            let userBalance
            if(typeof trx!=='undefined') userBalance =await trx.raw(`select sum(amount) from transactions where fromId=?`,[id]);
            else userBalance= await pg.raw(`select sum(amount) from transactions where fromId=?`,[id]);
            if(userBalance.rows[0].sum===null) return new requestMessage(200,{id:id,balance:0});
            return new requestMessage(200,{id:id,balance:userBalance.rows[0].sum});
        }
        catch(err){
            console.log(err);
            return new requestMessage(500,{error:'Something went wrong.'});
        }
    }
}