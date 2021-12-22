import * as express from 'express';
export const test = express.Router();

test.get('/', (req:any,res:any) =>{
    const userCPF=req.query.user;
    console.log('estou em tests');
    res.send('Test');
})

