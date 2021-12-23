import * as auth from 'basic-auth';
import { admins } from '..';
import { credentialsSchema } from '../schemas';

export const authenticator = (req:any,res:any,next:any) =>{
    const credentials=credentialsSchema.validate(auth(req));
    if(credentials.error){
        res.statusCode=400;
        return res.send(credentials.error);
    }
    if(!admins.verify(credentials.value.name,credentials.value.pass)){
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="example"')
        return res.send({error:'Access denied'});
    }
    else{
        console.log(`Access successful as ${credentials.value.name}`);
        next();
    }
}