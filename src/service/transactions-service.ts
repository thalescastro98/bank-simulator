import { TransactionsDB } from "../database";
import { ErrorMessage } from "../schemas";
import { UserDB } from "../database";

export const transactionsService = async (type:string,fromId:string,amount:string,toId:string|undefined) =>{
    const fromUserName = await UserDB.userName(fromId);
    let transactionResponse;
    if(type==='deposit') transactionResponse = await TransactionsDB.newDeposit(fromId,fromUserName,amount);
    if(type==='withdraw') transactionResponse = await TransactionsDB.newWithdraw(fromId,fromUserName,amount);
    if(type==='transfer'){
        if(typeof toId==='undefined') throw new ErrorMessage(400,{error:'Missing information.'});
        const toUserName = await UserDB.userName(toId);
        if(fromId===toId) throw new ErrorMessage(400,{error:`A ID can't transfer money to yourself.`});
        transactionResponse = await TransactionsDB.newTransfer(fromId,fromUserName,amount,toId,toUserName);
    }
    return transactionResponse;
}

export const getTransactionsService = async (id:string|undefined) => {
    if(typeof id === 'undefined') return TransactionsDB.getAllTransactions();
    const userName= await UserDB.userName(id);
    return TransactionsDB.getUserTransactions(id);
}