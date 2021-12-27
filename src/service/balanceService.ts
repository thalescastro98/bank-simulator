import { BalanceDB } from "../database";
import { UserDB } from "../database";
import { requestMessage } from "../schemas";

export const balanceService = async(id:string) => {
    try{
        const userName = await UserDB.userName(id);
        if(userName==='') return new requestMessage(404,{error:'This ID is not registered.'});
        const userBalanceRequest = await BalanceDB.getUserBalance(id);
        if(userBalanceRequest.status===200) userBalanceRequest.message.name=userName;
        return userBalanceRequest;
    }
    catch(err){
        console.log(err);
        return new requestMessage(500,{error:'Something went wrong.'});
    }
}