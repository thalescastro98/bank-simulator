import * as auth from 'basic-auth';
import { credentialsSchema, errorHandling } from '../schemas';
import { adminCredentialService } from '../service';

export const authenticator = async (req:any,res:any,next:any) =>{
    const credentials=credentialsSchema.validate(auth(req));
    if(credentials.error) return res.status(400).send(credentials.error);
    try{
        const verifyCredentials = await adminCredentialService(credentials.value.name,credentials.value.pass);
        if(verifyCredentials){
            console.log(`Access successful as ${credentials.value.name}`);
            next();            
        }
        else return res.status(500).send({error:'Something went wrong.'});
    }
    catch(err:any){
        return errorHandling(res,err);
    }
}