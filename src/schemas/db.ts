import { User } from "./user";
import {Transaction} from './transactions';
import { Admin } from "./admin";
import { v4 as uuidv4 } from 'uuid';

export class UserTable{
    userTable:User[]=[];
    register(cpf:string,name:string,email:string){
        if(this.userTable.find((a:User) => a.cpf===cpf)) return {error:'CPF has already been registered.'};
        const user:User={id:uuidv4(),cpf:cpf,name:name,email:email};
        this.userTable.push(user);
        return user;
    }
    idValidation(id:string){
        return this.userTable.some(a => a.id===id);
    }
}

export class TransactionTable{
    transactionTable:Transaction[]=[];
    newDeposit(id:string,amount:number){
        const dynamicDate = new Date();
        const deposit:Transaction={type:'credit',id:id,amount:amount,date:dynamicDate.toISOString(),descrition:`R$${amount.toFixed(2)} was deposited to id ${id}`};
        this.transactionTable.push(deposit);
        return deposit;
    }
    newWithdraw(id:string,amount:number){
        if(this.balanceCalculation(id)<amount) return {error:`ID ${id} does not have this amount of money.`};
        const dynamicDate = new Date();
        const withdraw:Transaction={type:'debit',id:id,amount:-amount,date:dynamicDate.toISOString(),descrition:`Id ${id} withdrew R$${amount.toFixed(2)}`};
        this.transactionTable.push(withdraw);
        return withdraw;
    }
    newTransfer(id:string,amount:number,toId:string){        
        if(this.balanceCalculation(id)<amount) return {error:`ID ${id} does not have this amount of money.`};
        const dynamicDate = new Date();
        const transferFrom:Transaction={type:'debit',id:id,amount:-amount,date:dynamicDate.toISOString(),descrition:`Id ${id} transferred R$${amount.toFixed(2)} to id ${toId}`};
        this.transactionTable.push(transferFrom);
        const transferTo:Transaction={type:'credit',id:toId,amount:amount,date:dynamicDate.toISOString(),descrition:`Id ${id} transferred R$${amount.toFixed(2)} to id ${toId}`};
        this.transactionTable.push(transferTo);
        return {from:transferFrom,to:transferTo};
    }
    transactions(id:string | undefined){
        if(typeof id=== 'undefined') return this.transactionTable;
        return this.transactionTable.filter((a:Transaction) =>  a.id=== id);
    }
    balanceCalculation(id:string){
        return this.transactionTable.reduce((acc:number,cur:Transaction) =>{
            if(cur.id===id) return acc+=cur.amount;
            return acc;
        },0);
    }
}

export class AdminTable{
    adminTable:Admin[]=[{id:uuidv4(),login:'admin',password:'admin'}];
    register(login:string,password:string){
        if(this.adminTable.some((a:Admin)=> a.login===login)) return {error:'This login is already being used'};
        const newAdmin:Admin={id:uuidv4(),login:login,password:password}
        this.adminTable.push(newAdmin);
        return newAdmin;
    }
    verify(login:string,password:string){
        return this.adminTable.some(a => a.login===login && a.password==password);
    }
}