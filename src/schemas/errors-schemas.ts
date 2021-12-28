export class ErrorMessage{
    status:number;
    message:any;
    constructor(status:number,message:any){
        this.status=status;
        this.message=message;
    }
}

export const errorHandling = (res:any,err:any) => {
    console.log(err);
    res.status( err.status ? err.status :500).send( err.message ? err.message : {error:'Something went wrong.'});
}