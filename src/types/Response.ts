export type Res<T> = {
    isSuccess:false;
    issues:any[];
    message:string
}|{
    isSuccess:true;
    message:string;
    result:T
}