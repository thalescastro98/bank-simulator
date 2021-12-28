import { pg } from ".";
import { requestMessage } from "../schemas";

export class GetTransactionsDB{
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