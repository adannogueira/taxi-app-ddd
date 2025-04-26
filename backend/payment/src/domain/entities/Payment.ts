import type { DomainEvent } from "../../common/DomainEvent";
import { PaymentProcessed } from "../events/PaymentProcessed";
import { Id } from "../vos/Id";

export class Payment {
	private readonly events: DomainEvent[] = [];

	constructor(
		private readonly transactionId: Id,
		private readonly rideId: Id,
		private readonly amount: number,
		private readonly date: Date,
		private readonly status: "success",
	) {
		if (amount <= 0) throw new Error("Invalid amount");
	}

	getId() {
		return this.transactionId;
	}

	getStatus() {
		return this.status;
	}

	emittedEvents() {
		return this.events;
	}

	toDto() {
		return {
			transactionId: this.transactionId.value,
			rideId: this.rideId.value,
			amount: this.amount,
			date: this.date,
			status: this.status,
		};
	}

	static create(data: { rideId: string; amount: number }) {
		const payment = new Payment(
			Id.create(),
			new Id(data.rideId),
			data.amount,
			new Date(),
			"success",
		);
		payment.events.push(new PaymentProcessed({ payment }));
		return payment;
	}
}
