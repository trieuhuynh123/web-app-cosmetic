export interface MomoPaymentResponse {
    partnerCode: string;
    accessKey: string;
    requestId: string;
    amount: string;
    orderId: string;
    orderInfo: string;
    redirectUrl: string;
    ipnUrl: string;
    requestType: string;
    signature: string;
    payUrl?: string;
    errorCode?: string;
    message?: string;
}
