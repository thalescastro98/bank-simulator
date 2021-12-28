import { pg } from ".";
import { requestMessage } from "../schemas";
import { BalanceDB } from ".";

export class TransactionsDB{
    static newDeposit = async (fromId:string,name:string,amount:string) => {
        try{
            const transaction = await pg.raw(`
            insert into transactions (type,fromId,amount,description)
            values ('credit',?,?,?)
            returning *;
            `,[fromId,amount,`${name} deposited R$${amount}.`]);
            return new requestMessage(200,transaction.rows[0]);
        }
        catch(err){
            console.log(err);
            return new requestMessage(500,{error:'Something went wrong.'});
        }
    }

    static newWithdraw = async (fromId:string,name:string,amount:string) =>{
        try{
            const transaction = await pg.transaction( async (trx) =>{
                try {
                    const userBalance = await BalanceDB.getUserBalance(fromId,trx);
                    if((userBalance.message.balance<(Number(amount))))
                        return new requestMessage(400,{error:`This user don't have this amount of money.`});
                    const inserction = await trx('transactions').insert({type:'debit',fromid:fromId,amount:-amount,description:`${name} withdrew R$${amount}.`}).returning('*');
                    return new requestMessage(200,inserction[0]);
                } catch (err) {
                    console.log(err);
                    return new requestMessage(500,{error:'Something went wrong.'});
                }
            });
            return transaction;
        }
        catch(err){
            console.log(err);
            return new requestMessage(500,{error:'Something went wrong.'});
        }
    }

    static newTransfer = async (fromId:string,fromName:string,amount:string,toId:string,toName:string) =>{
        try{
            if(fromId===toId) return new requestMessage(400,{error:`A ID can't transfer money to yourself.`});
            const transaction = await pg.transaction( async (trx) =>{
                try {
                    const userBalance = await BalanceDB.getUserBalance(fromId,trx);
                    if((userBalance.message.balance<(Number(amount))))
                        return new requestMessage(400,{error:`This user don't have this amount of money.`});
                    const inserction1 = await trx('transactions').insert({type:'debit',fromid:fromId,amount:-amount,description:`${fromName} transferred R$${amount} to ${toName}.`}).returning('*');
                    const inserction2 = await trx('transactions').insert({type:'credit',fromid:toId,amount:amount,description:`${fromName} transferred R$${amount} to ${toName}.`}).returning('*');
                    return new requestMessage(200,{from:inserction1[0],to:inserction2[0]});
                } catch (err) {
                    console.log(err);
                    return new requestMessage(500,{error:'Something went wrong.'});
                }
            });
            return transaction;
        }
        catch(err){
            console.log(err);
            return new requestMessage(500,{error:'Something went wrong.'});
        }
    }

    static getAllTransactions = async () => {
        try {
            const allTransaction = await pg.raw(`select * from transactions;`);
            return new requestMessage(200,allTransaction.rows);
        } catch (err) {
            console.log(err);
            return new requestMessage(500,{error:'Something went wrong.'});
        }
    }

    static getUserTransactions = async (fromId:string) => {
        try {
            const userTransaction = await pg.raw(`select * from transactions where fromId=?;`,[fromId]);
            return new requestMessage(200,userTransaction.rows);
        } catch (err) {
            console.log(err);
            return new requestMessage(500,{error:'Something went wrong.'});
        }
    }
}