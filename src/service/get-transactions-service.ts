import { GetTransactionsDB } from "../database";

export const getTransactionsService = (id:string|undefined) => {
    if(typeof id === 'undefined') return GetTransactionsDB.getAllTransactions();
    return GetTransactionsDB.getUserTransactions(id);
}