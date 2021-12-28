import { TransactionsDB } from "../database";
import { requestMessage } from "../schemas";
import { UserDB } from "../database";

export const transactionsService = async (type:string,fromId:string,amount:string,toId:string|undefined) =>{
    try {
        const fromUserName = await UserDB.userName(fromId);
        let transactionResponse= new requestMessage(500,{error:'Something went wrong.'});
        if(type==='deposit') transactionResponse = await TransactionsDB.newDeposit(fromId,fromUserName,amount);
        if(type==='withdraw') transactionResponse = await TransactionsDB.newWithdraw(fromId,fromUserName,amount);
        if(type==='transfer'){
            if(typeof toId==='undefined') throw new requestMessage(400,{error:'Missing information.'});
            const toUserName = await UserDB.userName(toId);
            transactionResponse = await TransactionsDB.newTransfer(fromId,fromUserName,amount,toId,toUserName);
        }
        return transactionResponse;
    } 
    catch (err) {
        console.log(err);
        return new requestMessage(500,{error:'Something went wrong.'});
    }
}

export const getTransactionsService = (id:string|undefined) => {
    if(typeof id === 'undefined') return TransactionsDB.getAllTransactions();
    return TransactionsDB.getUserTransactions(id);
}