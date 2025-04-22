import { inject } from "../../common/Registry";
import type { UseCase } from "../../common/UseCase";
import { ApplicationError } from "../errors/ApplicationError";
import {
	RIDE_REPOSITORY,
	type RideRepository,
} from "../interfaces/RideRepository.interface";

export class StartRide implements UseCase<string, void> {
	@inject(RIDE_REPOSITORY)
	private readonly rideRepository!: RideRepository;

	async execute(rideId: string) {
		const ride = await this.rideRepository.findById(rideId);
		if (!ride) throw new ApplicationError(Messages.NOT_FOUND, 404);
		try {
			ride?.start();
			await this.rideRepository.update(ride);
		} catch (e) {
			console.error(e);
			throw new ApplicationError(Messages.NOT_STARTABLE, 409);
		}
	}
}

export enum Messages {
	NOT_STARTABLE = "Current ride is not yet accepted",
	NOT_FOUND = "Ride not found",
}
