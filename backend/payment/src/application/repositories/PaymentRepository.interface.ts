import type { Payment } from "../../domain/entities/Payment";

export const PAYMENT_REPOSITORY = Symbol("PaymentRepository");

export interface PaymentRepository {
	persist(data: Payment): Promise<void>;
	findByRideId(rideId: string): Promise<Payment | null>;
}
