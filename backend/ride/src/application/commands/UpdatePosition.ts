import { inject } from "../../common/Registry";
import type { UseCase } from "../../common/UseCase";
import { Position } from "../../domain/entities/Position";
import { ApplicationError } from "../errors/ApplicationError";
import {
	POSITION_REPOSITORY,
	type PositionRepository,
} from "../interfaces/PositionRepository.interface";
import {
	RIDE_REPOSITORY,
	type RideRepository,
} from "../interfaces/RideRepository.interface";

export class UpdatePosition implements UseCase<Input, void> {
	@inject(POSITION_REPOSITORY)
	private readonly positionRepository!: PositionRepository;
	@inject(RIDE_REPOSITORY)
	private readonly rideRepository!: RideRepository;

	async execute(data: Input) {
		const ride = await this.rideRepository.findById(data.rideId);
		if (!ride?.isInProgress())
			throw new ApplicationError(Messages.RIDE_NOT_IN_PROGRESS, 409);
		const pastPositions = await this.positionRepository.listByRideId(
			data.rideId,
		);
		const currentPosition = Position.create({
			lat: data.lat,
			long: data.long,
			rideId: ride.identify(),
		});
		const lastPosition = pastPositions.at(-1);
		const distance = lastPosition
			? lastPosition.distanceUntil(currentPosition.getCoordinates())
			: 0;
		ride.updateTravelledDistance(distance);
		await this.rideRepository.update(ride);
		await this.positionRepository.update(currentPosition);
	}
}

export enum Messages {
	RIDE_NOT_IN_PROGRESS = "Can't update position for a ride that's not in progress",
}

export type Input = {
	rideId: string;
	lat: number;
	long: number;
};
