import * as express from 'express';
import { authenticator } from './middlewares';
import { UserTable,TransactionTable, AdminTable } from './schemas';
import { registerRouter } from './register';
import { transactionsRouter } from './transactions';
import { balanceRouter } from './balance';
import { registerAdminRouter } from './register';
// import {test} from './test';

const app=express();

app.use(authenticator);

export const users = new UserTable();
export const transactions = new TransactionTable();
export const admins = new AdminTable();

app.get('/',(req:any,res:any) =>{
    res.send('Working');
});

// app.use('/test',test);

app.use('/register',registerRouter);

// app.get('/register/', (req:any,res:any) =>{
//     if(req.query.cpf && req.query.name && req.query.email){
//         res.send(users.register(req.query.cpf,req.query.name,req.query.email,0));
//         // return res.json(users.userTable);
//     }
//     else res.send('Insufficient information');
// })

app.use('/transactions', transactionsRouter);

// app.get('/transactions/', (req:any,res:any) =>{
//     res.send(transactions.transactions(req.query.user));
// })

app.use('/balance',balanceRouter);

// app.get('/balance/:id', (req:any,res:any) =>{
//     res.send(users.userBalance(req.params.id));
// })

// app.use(express.json());

// app.post('/test2',(req:any,res:any) =>{
//     console.log(req.body);
//     res.send(req.body);
// });

app.use('/register/admin',registerAdminRouter);

app.listen(8080);