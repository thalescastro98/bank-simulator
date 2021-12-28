import { BalanceDB } from "../database";
import { UserDB } from "../database";

export const balanceService = async(id:string) => {
    const userName = await UserDB.userName(id);
    const userBalanceRequest = await BalanceDB.getUserBalance(id);
    return {id:userBalanceRequest.id,name:userName,balance:userBalanceRequest.balance};
}