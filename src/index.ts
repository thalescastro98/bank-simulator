import * as express from 'express';
import { authenticator } from './middlewares';
import { registerAdminRouter, registerRouter, transactionsRouter,balanceRouter } from './routes';
import { pg } from './database';
require('dotenv').config();

(async () => {
    await pg.migrate.latest();
})();

const app=express();

app.use(authenticator);

app.get('/',async (req:any,res:any) =>{
    res.send('Working');
});

app.use('/register',registerRouter);

app.use('/transactions', transactionsRouter);

app.use('/balance',balanceRouter);

app.use('/register/admin',registerAdminRouter);

app.listen(process.env.APP_PORT || 8080,()=>{
    console.log(`Server listening on ${process.env.APP_PORT || 8080}`);
});
