import { inject } from "../../common/Registry";
import type { UseCase } from "../../common/UseCase";
import {
	POSITION_REPOSITORY,
	type PositionRepository,
} from "../interfaces/PositionRepository.interface";

export class ListPositionByRideId implements UseCase<string, Output> {
	@inject(POSITION_REPOSITORY)
	private readonly positionRepository!: PositionRepository;

	async execute(rideId: string) {
		const positions = await this.positionRepository.listByRideId(rideId);
		return positions.map((position) => position.toDto());
	}
}

export enum Messages {
	NOT_PASSENGER = "User is not passenger",
	ALREADY_IN_RIDE = "Passenger is already in a ride",
}

export type Output = {
	positionId: string;
	rideId: string;
	lat: number;
	long: number;
	date: Date;
}[];
