import type {
	RideProjection,
	RideProjectionDto,
} from "../../application/interfaces/RideProjection.interface";
import { inject } from "../../common/Registry";
import {
	READER_DB,
	type DatabaseConnection,
} from "../database/PostgresDatabase";

export class RideProject implements RideProjection {
	@inject(READER_DB)
	private readonly database!: DatabaseConnection;

	async findById(rideId: string): Promise<RideProjectionDto | null> {
		const [result] = await this.database.query<DatabaseProjection>(
			"select * from ccca.ride_projection where ride_id = $1",
			[rideId],
		);
		return result
			? {
					distance: result.distance,
					driverName: result.driver_name,
					fare: result.fare,
					passengerName: result.passenger_name,
					paymentId: result.payment_id,
					paymentStatus: result.payment_status,
					rideId: result.ride_id,
					status: result.status,
				}
			: null;
	}
}

type DatabaseProjection = {
	ride_id: string;
	passenger_name: string | null;
	driver_name: string | null;
	fare: number;
	distance: number;
	status: string;
	payment_id: string | null;
	payment_status: string;
};
