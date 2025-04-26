import type { DomainEvent } from "../../common/DomainEvent";
import type { Payment } from "../entities/Payment";

export class PaymentProcessed implements DomainEvent {
	constructor(private readonly data: { payment: Payment }) {}

	name() {
		return this.constructor.name;
	}

	message() {
		return JSON.stringify(this.data.payment.toDto());
	}
}
