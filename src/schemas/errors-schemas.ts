export class ErrorMessage{
    errorStatus:number;
    errorMessage:any;
    constructor(errorStatus:number,errorMessage:any){
        this.errorStatus=errorStatus;
        this.errorMessage=errorMessage;
    }
}

export const errorHandling = (res:any,err:any) => {
    console.log(err);
    res.status( err.errorStatus ? err.errorStatus :500).send( err.errorMessage ? err.errorMessage : {error:'Something went wrong.'});
}