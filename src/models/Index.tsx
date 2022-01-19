
export interface IUser {
    uid : string,
    displayName : string,
    email : string,
    emailVerified : boolean,
    phoneNumber : number,
    isAdmin : boolean,
    metadata : object,
    isVerified? : boolean
    isRejected? : boolean
    linkId? : string
}

export interface IUserLog {
    userUID? : string | null
    name : string | null | undefined
    type : string
    field : string
    oldValue : string
    newValue : string | number
    timestamp? : Date
    createdTime : string
    createdBy : string | undefined | null
}

export interface IChartData {
    name: string,
    amount: number,
    color: string,
    legendFontColor: string,
    legendFontSize: number,
}

export interface IAccount{
    TotalAmount? : number
    RemainingAmount  : number
    MinimumBalance? : number
    TotalInterest? : number
    WithdrawalAmount? : number
    IsActive? : boolean
}

export interface IUserAccount {
    docid? : string
    name? : string
    balance? : number
    withdrawal? : number
    totalWithdrawal? : number
    totalInterest? : number
    minDeposit? : number
    advancePay? : number
    uid? : string
    timestamp? : Date
    createdDate? : string
    createdBy? : string | undefined | null
}

export interface ITLog {
    docID? : string
    name : string
    type : string
    creditType : string | null
    amount : number
    timestamp? : Date
    createdTime : string
    createdBy : string | undefined | null
}

export interface IUALog {
    docID? : string
    name : string
    type : string
    timestamp? : Date
    createdTime : string
    createdBy : string | undefined | null
}

export interface IDApp{
    hosturl : string
    version : string
}

export interface IDDeveloper {
    name : string
    fb : string
    insta : string
    telegram : string
    github : string
}

export interface IQueries {
    name : string | null | undefined
    uid : string | null | undefined
    timestamp : Date
    createdDate : string
    createdBy : string | null | undefined
    isResolved : boolean
    query : string
    email : string | null | undefined,
    phoneNumber : string | null | undefined
}