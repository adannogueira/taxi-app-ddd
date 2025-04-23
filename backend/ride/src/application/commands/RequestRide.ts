import { inject } from "../../common/Registry";
import type { UseCase } from "../../common/UseCase";
import { Ride } from "../../domain/entities/Ride";
import { transactional } from "../../infra/database/transactional";
import {
	ACCOUNT_GATEWAY,
	type AccountGateway,
} from "../../infra/gateway/AccountGateway";
import { ApplicationError } from "../errors/ApplicationError";
import {
	RIDE_REPOSITORY,
	type RideRepository,
} from "../interfaces/RideRepository.interface";

export class RequestRide implements UseCase<Input, Output> {
	@inject(ACCOUNT_GATEWAY)
	private readonly accountGateway!: AccountGateway;
	@inject(RIDE_REPOSITORY)
	private readonly rideRepository!: RideRepository;

	@transactional
	async execute(data: Input) {
		const user = await this.accountGateway.findById(data.passengerId);
		if (!user) throw new ApplicationError(Messages.USER_NOT_FOUND, 404);
		if (user.isDriver) throw new ApplicationError(Messages.NOT_PASSENGER, 409);
		const existingRide = await this.rideRepository.findByPassengerId(
			user.accountId,
		);
		if (existingRide?.isActive()) {
			throw new ApplicationError(Messages.ALREADY_IN_RIDE, 409);
		}
		const ride = Ride.create(data);
		await this.rideRepository.persist(ride);
		return { rideId: ride.identify().value };
	}
}

export enum Messages {
	NOT_PASSENGER = "User is not passenger",
	ALREADY_IN_RIDE = "Passenger is already in a ride",
	USER_NOT_FOUND = "User not found",
}

export type Input = {
	passengerId: string;
	fromLat: number;
	fromLong: number;
	toLat: number;
	toLong: number;
};

export type Output = {
	rideId: string;
};
