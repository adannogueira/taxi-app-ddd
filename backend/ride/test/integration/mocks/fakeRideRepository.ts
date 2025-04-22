import type { RideRepository } from "../../../src/application/interfaces/RideRepository.interface";
import type { Ride } from "../../../src/domain/entities/Ride";

export class fakeRideRepository implements RideRepository {
	private rides: Ride[] = [];

	async findActiveByDriverId(driverId: string): Promise<Ride | null> {
		return Promise.resolve(
			this.rides.find(
				(ride) =>
					ride.getDriverId()?.value === driverId &&
					ride.toDto().status !== "completed",
			) || null,
		);
	}

	update(ride: Ride): Promise<void> {
		const index = this.rides.findIndex(
			(r) => r.identify().value === ride.identify().value,
		);
		if (index !== -1) {
			this.rides[index] = ride;
		}
		return Promise.resolve();
	}

	async findByPassengerId(passengerId: string): Promise<Ride | null> {
		return Promise.resolve(
			this.rides.find((ride) => ride.getPassengerId().value === passengerId) ||
				null,
		);
	}
	async findById(rideId: string): Promise<Ride | null> {
		return Promise.resolve(
			this.rides.find((ride) => ride.identify().value === rideId) || null,
		);
	}
	async persist(rideData: Ride): Promise<void> {
		this.rides.push(rideData);
		return Promise.resolve();
	}
}
