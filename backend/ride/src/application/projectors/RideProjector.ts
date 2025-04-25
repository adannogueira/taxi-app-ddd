import { inject } from "../../common/Registry";
import {
	READER_DB,
	type DatabaseConnection,
} from "../../infra/database/PostgresDatabase";
import {
	ACCOUNT_GATEWAY,
	type AccountGateway,
} from "../../infra/gateway/AccountGateway";
import type { RideRequested } from "../../domain/events/RideRequested";
import type { RideAccepted } from "../../domain/events/RideAccepted";
import type { RideFinished } from "../../domain/events/RideFinished";

export const RIDE_PROJECTOR = Symbol("RideProjector");

export class RideProjector {
	@inject(READER_DB)
	private readonly database!: DatabaseConnection;

	@inject(ACCOUNT_GATEWAY)
	private readonly accountGateway!: AccountGateway;

	async onRideRequested(event: RideRequested): Promise<void> {
		const passenger = await this.accountGateway.findById(
			event.data.passengerId,
		);
		await this.database.query(
			`
        insert into ccca.ride_projection
        (ride_id, passenger_name, driver_name, fare, distance, status, payment_id, payment_status)
        values ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
			[
				event.data.rideId,
				passenger?.name || null,
				null,
				event.data.fare,
				event.data.distance,
				event.data.status,
				null,
				"pending",
			],
		);
	}

	async onRideAccepted(event: RideAccepted): Promise<void> {
		const driver = await this.accountGateway.findById(event.data.driverId);
		await this.database.query(
			`
        update ccca.ride_projection
        set driver_name = $1, status = $2
        where ride_id = $3  
      `,
			[driver?.name || null, event.data.status, event.data.rideId],
		);
	}

	async onRideFinished(event: RideFinished): Promise<void> {
		await this.database.query(
			`
        update ccca.ride_projection
        set fare = $1, distance = $2, status = $3
        where ride_id = $4 
      `,
			[
				event.data.amount,
				event.data.distance,
				event.data.status,
				event.data.rideId,
			],
		);
	}

	async onPaymentProcessed(event: any): Promise<void> {
		await this.database.query(
			`
        update ccca.ride_projection
        set payment_id = $1, payment_status = $2, fare = $3
        where ride_id = $4
      `,
			[event.transactionId, event.status, event.amount, event.rideId],
		);
	}
}
