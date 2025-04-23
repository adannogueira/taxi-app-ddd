import { randomUUIDv7 } from "bun";
import type {
	RideProjection,
	RideProjectionDto,
} from "../../../src/application/interfaces/RideProjection.interface";
import { Id } from "../../../src/domain/vos/Id";
import { faker } from "@faker-js/faker/locale/pt_BR";

export class fakeRideProjection implements RideProjection {
	private readonly data: RideProjectionDto[] = [];

	async findById(rideId: string): Promise<RideProjectionDto | null> {
		const found = this.data.find((ride) => ride.rideId === rideId);
		return found || null;
	}

	factory(data: Partial<RideProjectionDto>): RideProjectionDto {
		const ride = {
			rideId: randomUUIDv7(),
			distance: faker.number.int({ max: 100, min: 1 }),
			driverName: faker.person.fullName(),
			fare: faker.number.int({ max: 100, min: 1 }),
			passengerName: faker.person.fullName(),
			paymentId: randomUUIDv7(),
			paymentStatus: "processed",
			status: "completed",
			...data,
		};
		this.data.push(ride);
		return ride;
	}
}
