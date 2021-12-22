import * as express from 'express';
export const test2 = express.Router();

test2.get('/', (req:any,res:any) =>{
    const userCPF=req.query.user;
    console.log('estou em tests');
    res.send('Test');
})

