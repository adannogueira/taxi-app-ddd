import { inject } from "../../common/Registry";
import type { UseCase } from "../../common/UseCase";
import { ApplicationError } from "../errors/ApplicationError";
import {
	RIDE_PROJECTION,
	type RideProjection,
	type RideProjectionDto,
} from "../interfaces/RideProjection.interface";

export class GetRideById implements UseCase<string, RideProjectionDto | null> {
	@inject(RIDE_PROJECTION)
	private readonly rideProjection!: RideProjection;

	async execute(rideId: string): Promise<RideProjectionDto | null> {
		const foundRide = await this.rideProjection.findById(rideId);
		if (!foundRide) throw new ApplicationError(Messages.NOT_FOUND, 404);
		return foundRide;
	}
}

export enum Messages {
	NOT_FOUND = "Ride not found",
}
