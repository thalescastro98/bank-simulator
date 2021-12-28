import { BalanceDB } from "../database";
import { UserDB } from "../database";
import { requestMessage } from "../schemas";

export const balanceService = async(id:string) => {
    const userName = await UserDB.userName(id);
    if(userName==='') throw new requestMessage(404,{error:'This ID is not registered.'});
    const userBalanceRequest = await BalanceDB.getUserBalance(id);
    return {id:userBalanceRequest.id,name:userName,balance:userBalanceRequest.balance};
}