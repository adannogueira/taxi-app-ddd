import { inject } from "../common/Registry";
import type { UseCase } from "../common/UseCase";
import { ApplicationError } from "./ApplicationError";
import {
	PAYMENT_REPOSITORY,
	type PaymentRepository,
} from "./repositories/PaymentRepository.interface";

export const GET_PAYMENT_BY_RIDE_ID = Symbol("GetPaymentByRideId");

export class GetPaymentByRideId implements UseCase<string, Output> {
	@inject(PAYMENT_REPOSITORY)
	private readonly paymentRepository!: PaymentRepository;

	async execute(rideId: string): Promise<Output> {
		const payment = await this.paymentRepository.findByRideId(rideId);
		if (payment) return payment.toDto();
		throw new ApplicationError(Messages.NOT_FOUND, 404);
	}
}

enum Messages {
	NOT_FOUND = "Transaction not found",
}

export type Output = {
	transactionId: string;
	rideId: string;
	amount: number;
	date: Date;
	status: "success";
};
