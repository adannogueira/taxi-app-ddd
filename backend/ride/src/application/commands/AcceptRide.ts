import { inject } from "../../common/Registry";
import type { UseCase } from "../../common/UseCase";
import { Id } from "../../domain/vos/Id";
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

export class AcceptRide implements UseCase<Input, void> {
	@inject(ACCOUNT_GATEWAY)
	private readonly accountGateway!: AccountGateway;
	@inject(RIDE_REPOSITORY)
	private readonly rideRepository!: RideRepository;

	@transactional
	async execute(data: Input) {
		const user = await this.accountGateway.findById(data.driverId);
		if (!user) throw new ApplicationError(Messages.USER_NOT_FOUND, 404);
		if (!user.isDriver) throw new ApplicationError(Messages.NOT_DRIVER, 409);
		const ride = await this.rideRepository.findById(data.rideId);
		if (!ride) throw new ApplicationError(Messages.RIDE_NOT_FOUND, 404);
		if (!ride.isAwaitingDriver()) {
			throw new ApplicationError(Messages.NOT_ACCEPTABLE, 409);
		}
		const driverRide = await this.rideRepository.findActiveByDriverId(
			user.accountId,
		);
		if (driverRide) throw new ApplicationError(Messages.ALREADY_DRIVING, 409);
		ride.confirmDriverAcceptance(new Id(user.accountId));
		await this.rideRepository.update(ride);
	}
}

export enum Messages {
	NOT_DRIVER = "User is not driver",
	NOT_ACCEPTABLE = "Current ride can't be accepted",
	ALREADY_DRIVING = "Driver currently in another ride",
	USER_NOT_FOUND = "User not found",
	RIDE_NOT_FOUND = "Ride not found",
}

export type Input = {
	driverId: string;
	rideId: string;
};
