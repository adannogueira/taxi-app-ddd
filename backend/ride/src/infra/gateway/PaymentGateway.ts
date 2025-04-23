import { inject } from "../../common/Registry";
import { HTTP_CLIENT, type HttpClient } from "../http/HttpClient";

export const PAYMENT_GATEWAY = Symbol("PaymentGateway");

export interface PaymentGateway {
	findByRideId(rideId: string): Promise<PaymentDto | null>;
}

export type PaymentDto = {
	transactionId: string;
	rideId: string;
	amount: number;
	date: string;
	status: string;
};

export class PaymentGatewayHttp implements PaymentGateway {
	@inject(HTTP_CLIENT)
	private readonly httpClient!: HttpClient;

	async findByRideId(rideId: string): Promise<PaymentDto | null> {
		try {
			const output = await this.httpClient.get<PaymentDto>(
				`http://localhost:5000/transactions/${rideId}`,
			);
			return output;
		} catch (e) {
			console.error(e);
			return null;
		}
	}
}
