import { Knex } from "knex";
import { pg } from ".";

export class BalanceDB{
    static getUserBalance = async (id:string,trx?:Knex.Transaction<any, any[]>) => {
        let userBalance;
        if(typeof trx!=='undefined') userBalance =await trx.raw(`select sum(amount) from transactions where fromId=?`,[id]);
        else userBalance= await pg.raw(`select sum(amount) from transactions where fromId=?`,[id]);
        if(userBalance.rows[0].sum===null) return {id:id,balance:0};
        return {id:id,balance:userBalance.rows[0].sum as number};
    }
}