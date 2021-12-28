import * as auth from 'basic-auth';
import { credentialsSchema } from '../schemas';
import { adminCredentialService } from '../service';

export const authenticator = async (req:any,res:any,next:any) =>{
    const credentials=credentialsSchema.validate(auth(req));
    if(credentials.error){
        res.statusCode=400;
        return res.send(credentials.error);
    }
    try{
        const verifyCredentials = await adminCredentialService(credentials.value.name,credentials.value.pass);
        if(verifyCredentials.status===200){
            console.log(verifyCredentials.message);
            next();            
        }
        else{
            return res.status(verifyCredentials.status).send(verifyCredentials.message);
        }
    }
    catch(err){
        console.log(err)
        return res.status(500).send({error:'Something went wrong.'});
    }
}