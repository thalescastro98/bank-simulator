import * as express from 'express';
import { authenticator } from './middlewares';
import { UserTable,TransactionTable, AdminTable } from './schemas';
import { registerAdminRouter, registerRouter, transactionsRouter,balanceRouter } from './routes';

import { pg } from './database/db';

// const knex = require('knex')({
//     client: 'pg',
//     connection: {
//       host : 'localhost',
//       port : 5432,
//       user : 'postgres',
//       password : 'password',
//       database : 'postgres'
//     }
//   });

const app=express();

app.use(authenticator);

export const users = new UserTable();
export const transactions = new TransactionTable();
export const admins = new AdminTable();

app.get('/',async (req:any,res:any) =>{
    // console.log(await pg.select(1));
    res.send('Working');
});

app.use('/register',registerRouter);

app.use('/transactions', transactionsRouter);

app.use('/balance',balanceRouter);

app.use('/register/admin',registerAdminRouter);

app.listen(8080,()=>{
    console.log('start');
});
