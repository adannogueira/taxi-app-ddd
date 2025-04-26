import { inject } from "../common/Registry";
import type { UseCase } from "../common/UseCase";
import { Payment } from "../domain/entities/Payment";
import { ApplicationError } from "./ApplicationError";
import {
	PAYMENT_REPOSITORY,
	type PaymentRepository,
} from "./repositories/PaymentRepository.interface";

export const PROCESS_PAYMENT = Symbol("ProcessPayment");

export class ProcessPayment implements UseCase<Input, Output> {
	@inject(PAYMENT_REPOSITORY)
	private readonly paymentRepository!: PaymentRepository;

	async execute(data: Input): Promise<{ transactionId: string }> {
		try {
			const payment = Payment.create({
				amount: data.amount,
				rideId: data.rideId,
			});
			await this.paymentRepository.persist(payment);
			return { transactionId: payment.getId().value };
		} catch (e) {
			if (
				e &&
				typeof e === "object" &&
				"message" in e &&
				typeof e.message === "string"
			)
				throw new ApplicationError(e.message, 422);
			throw e;
		}
	}
}

export type Input = {
	rideId: string;
	amount: number;
};

export type Output = { transactionId: string };
