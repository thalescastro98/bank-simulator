import { pg } from ".";
import { ErrorMessage } from "../schemas";
import { BalanceDB } from ".";

export class TransactionsDB{
    static newDeposit = async (fromId:string,name:string,amount:string) => {
        const transaction = await pg.raw(`
            insert into transactions (type,fromId,amount,description)
            values ('credit',?,?,?)
            returning *;
            `,[fromId,amount,`${name} deposited R$${amount}.`]);
        return transaction.rows[0];
    }

    static newWithdraw = async (fromId:string,name:string,amount:string) =>{
        const transaction = await pg.transaction( async (trx) =>{
            const userBalance = await BalanceDB.getUserBalance(fromId,trx);
            if((userBalance.balance<(Number(amount))))
                throw new ErrorMessage(400,{error:`This user don't have this amount of money.`});
            const inserction = 
                    await trx('transactions')
                        .insert({type:'debit',fromid:fromId,amount:-amount,description:`${name} withdrew R$${amount}.`})
                        .returning('*');
            return inserction[0];
        });
        return transaction;
    }

    static newTransfer = async (fromId:string,fromName:string,amount:string,toId:string,toName:string) =>{
        const transaction = await pg.transaction( async (trx) =>{
            const userBalance = await BalanceDB.getUserBalance(fromId,trx);
            if((userBalance.balance<(Number(amount))))
                throw new ErrorMessage(400,{error:`This user don't have this amount of money.`});
            const inserction1 =
                    await trx('transactions')
                        .insert({type:'debit',fromid:fromId,amount:-amount,description:`${fromName} transferred R$${amount} to ${toName}.`})
                        .returning('*');
            const inserction2 = 
                    await trx('transactions')
                        .insert({type:'credit',fromid:toId,amount:amount,description:`${fromName} transferred R$${amount} to ${toName}.`})
                        .returning('*');
            return {from:inserction1[0],to:inserction2[0]};
        });
        return transaction;
    }

    static getAllTransactions = async () => {
        const allTransaction = await pg.raw(`select * from transactions;`);
        return allTransaction.rows;
    }

    static getUserTransactions = async (fromId:string) => {
        const userTransaction = await pg.raw(`select * from transactions where fromId=?;`,[fromId]);
        return userTransaction.rows;
    }
}