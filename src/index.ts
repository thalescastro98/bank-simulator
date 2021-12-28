import * as express from 'express';
import { authenticator } from './middlewares';
import { registerAdminRouter, registerRouter, transactionsRouter,balanceRouter } from './routes';

const app=express();

app.use(authenticator);

app.get('/',async (req:any,res:any) =>{
    res.send('Working');
});

app.use('/register',registerRouter);

app.use('/transactions', transactionsRouter);

app.use('/balance',balanceRouter);

app.use('/register/admin',registerAdminRouter);

app.listen(8080,()=>{
    console.log('start');
});
