import type { PaymentRepository } from "../../../src/application/repositories/PaymentRepository.interface";
import type { Payment } from "../../../src/domain/entities/Payment";

export class fakePaymentRepository implements PaymentRepository {
	private transactions: Payment[] = [];

	findByRideId(rideId: string): Promise<Payment | null> {
		throw new Error("Method not implemented.");
	}

	persist(paymentData: Payment): Promise<void> {
		this.transactions.push(paymentData);
		return Promise.resolve();
	}
}
