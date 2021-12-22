export interface Transaction {
    type: 'debit' | 'credit';
    id:string;
    amount:number;
    date:string;
    descrition: string;
}
