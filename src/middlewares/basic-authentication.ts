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
        if(verifyCredentials){
            console.log(`Access successful as ${credentials.value.name}`);
            next();            
        }
        else{
            return res.status(500).send({error:'Something went wrong.'});
        }
    }
    catch(err:any){
        console.log(err)
        return res.status( err.status ? err.status :500).send( err.message ? err.message : {error:'Something went wrong.'});
    }
}