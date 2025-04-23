import { inject } from "../../common/Registry";
import type { UseCase } from "../../common/UseCase";
import { transactional } from "../../infra/database/transactional";
import { ApplicationError } from "../errors/ApplicationError";
import {
	POSITION_REPOSITORY,
	type PositionRepository,
} from "../interfaces/PositionRepository.interface";
import {
	RIDE_REPOSITORY,
	type RideRepository,
} from "../interfaces/RideRepository.interface";

export class FinishRide implements UseCase<string, void> {
	@inject(RIDE_REPOSITORY)
	private readonly rideRepository!: RideRepository;
	@inject(POSITION_REPOSITORY)
	private readonly positionRepository!: PositionRepository;

	@transactional
	async execute(rideId: string) {
		const ride = await this.rideRepository.findById(rideId);
		if (!ride) throw new ApplicationError(Messages.NOT_FOUND, 404);
		if (!ride.isInProgress())
			throw new ApplicationError(Messages.NOT_IN_PROGRESS, 409);
		const pastPositions = await this.positionRepository.listByRideId(rideId);
		if (!pastPositions.length)
			throw new ApplicationError(Messages.NO_MOVEMENT_REGISTERED, 409);
		ride.finish(pastPositions);
		await this.rideRepository.update(ride);
	}
}

export enum Messages {
	NOT_IN_PROGRESS = "Current ride is not in progress",
	NOT_FOUND = "Ride not found",
	NO_MOVEMENT_REGISTERED = "Can't finish ride as no movement was registered",
}
