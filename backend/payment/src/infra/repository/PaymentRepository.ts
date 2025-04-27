import {
	DATABASE,
	type DatabaseConnection,
} from "../database/PostgresDatabase";
import type { PaymentRepository } from "../../application/repositories/PaymentRepository.interface";
import { Payment } from "../../domain/entities/Payment";
import { inject } from "../../common/Registry";
import { Id } from "../../domain/vos/Id";
import type { DomainEvent } from "../../common/DomainEvent";
import { QUEUE, type Queue } from "../queue/Queue";
import { randomUUIDv7 } from "bun";

type DatabasePayment = {
	transaction_id: string;
	ride_id: string;
	amount: string;
	date: string;
	status: string;
};

export class PaymentRepo implements PaymentRepository {
	@inject(DATABASE)
	private readonly connection!: DatabaseConnection;
	@inject(QUEUE)
	private readonly queue!: Queue;

	async persist(paymentData: Payment): Promise<void> {
		const paymentDto = paymentData.toDto();
		await this.connection.query(
			"insert into ccca.transaction (transaction_id, ride_id, amount, date, status) values ($1, $2, $3, $4, $5);",
			[
				paymentDto.transactionId,
				paymentDto.rideId,
				paymentDto.amount,
				paymentDto.date,
				paymentDto.status,
			],
		);
		await this.persistEvents(paymentData.emittedEvents());
	}

	async findByRideId(rideId: string): Promise<Payment | null> {
		const [foundPayment] = await this.connection.query<DatabasePayment>(
			"select * from ccca.transaction where ride_id = $1;",
			[rideId],
		);
		return foundPayment
			? new Payment(
					new Id(foundPayment.transaction_id),
					new Id(foundPayment.ride_id),
					Number(foundPayment.amount),
					new Date(foundPayment.date),
					foundPayment.status as "success",
				)
			: null;
	}

	private async persistEvents(events: DomainEvent[]): Promise<void> {
		if (!events.length) return;
		for (const event of events) {
			await this.connection.query(
				"insert into ccca.events (event_id, name, message, date, published, published_at) values ($1, $2, $3, $4, $5, $6);",
				[
					randomUUIDv7(),
					event.name(),
					event.message(),
					new Date(),
					false,
					null,
				],
			);
			this.queue.publish(event);
		}
	}
}
