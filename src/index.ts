import * as express from 'express';
import { authenticator } from './middlewares';
import { UserTable,TransactionTable, AdminTable } from './schemas';
import { registerAdminRouter, registerRouter, transactionsRouter,balanceRouter } from './routes';

const app=express();

app.use(authenticator);

export const users = new UserTable();
export const transactions = new TransactionTable();
export const admins = new AdminTable();

app.get('/',(req:any,res:any) =>{
    res.send('Working');
});

app.use('/register',registerRouter);

app.use('/transactions', transactionsRouter);

app.use('/balance',balanceRouter);

app.use('/register/admin',registerAdminRouter);

app.listen(8080);