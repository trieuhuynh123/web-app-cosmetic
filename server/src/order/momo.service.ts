import { Injectable, BadRequestException } from '@nestjs/common';
import { Order, OrderDocument } from './entities/order.entity';
import axios from 'axios';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { MomoPaymentResponse } from './interfaces/momo-response.interface';

@Injectable()
export class MomoService {
    private partnerCode: string;
    private accessKey: string;
    private secretKey: string;
    private requestType: string;
    private endpoint: string;

    constructor(private configService: ConfigService) {
        this.partnerCode = this.configService.get<string>('MOMO_PARTNER_CODE');
        this.accessKey = this.configService.get<string>('MOMO_ACCESS_KEY');
        this.secretKey = this.configService.get<string>('MOMO_SECRET_KEY');
        this.requestType = 'payWithATM'; // Hoặc 'captureMoMoWallet' tùy vào loại thanh toán bạn muốn sử dụng
        this.endpoint = 'https://test-payment.momo.vn/gw_payment/transactionProcessor'; // Sử dụng endpoint thử nghiệm
    }

    // Tạo URL thanh toán Momo
    async createPayment(order: OrderDocument): Promise<string> {
        const orderId = order._id.toString(); // Sử dụng _id thay vì id
        const amount = order.totalAmount.toString();
        const orderInfo = `Đơn hàng ${orderId}`;
        const redirectUrl = `${this.configService.get<string>('FRONTEND_URL')}/order-confirmation?orderId=${orderId}`; // URL sau khi thanh toán
        const ipnUrl = `${this.configService.get<string>('BACKEND_URL')}/orders/momo/ipn`; // URL nhận thông báo từ Momo

        const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${redirectUrl}&requestId=${orderId}&requestType=${this.requestType}`;

        const signature = crypto.createHmac('sha256', this.secretKey)
            .update(rawSignature)
            .digest('hex');

        const body = {
            partnerCode: this.partnerCode,
            accessKey: this.accessKey,
            requestId: orderId,
            amount,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            requestType: this.requestType,
            signature,
            lang: 'vi',
        };

        try {
            const response = await axios.post<MomoPaymentResponse>(this.endpoint, body);
            if (response.data && response.data.payUrl) {
                return response.data.payUrl;
            } else {
                throw new BadRequestException('Không nhận được URL thanh toán từ Momo.');
            }
        } catch (error) {
            console.error('Lỗi khi tạo thanh toán Momo:', error);
            throw new BadRequestException('Không thể tạo thanh toán Momo.');
        }
    }
}
