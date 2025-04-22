import { describe, test, beforeEach, expect } from "bun:test";
import { faker } from "@faker-js/faker";
import { generate } from "@fnando/cpf";
import {
	RIDE_REPOSITORY,
	type RideRepository,
} from "../../src/application/interfaces/RideRepository.interface";
import { RequestRide } from "../../src/application/commands/RequestRide";
import { AcceptRide } from "../../src/application/commands/AcceptRide";
import { Messages, StartRide } from "../../src/application/commands/StartRide";
import { fakeRideRepository } from "./mocks/fakeRideRepository";
import { ACCOUNT_GATEWAY } from "../../src/infra/gateway/AccountGateway";
import { fakeAccountGateway } from "./mocks/fakeAccountGateway";
import { Registry } from "../../src/common/Registry";

describe("StartRide", () => {
	let requestRide: RequestRide;
	let acceptRide: AcceptRide;
	let startRide: StartRide;
	let registry: Registry;
	let rideRepository: RideRepository;

	beforeEach(() => {
		registry = Registry.getInstance();
		rideRepository = new fakeRideRepository();
		registry.provide(ACCOUNT_GATEWAY, new fakeAccountGateway(), true);
		registry.provide(RIDE_REPOSITORY, rideRepository, true);
		requestRide = new RequestRide();
		acceptRide = new AcceptRide();
		startRide = new StartRide();
	});

	describe("execute()", () => {
		test("driver should start a ride", async () => {
			const passengerData = {
				name: faker.person.fullName(),
				email: faker.internet.email(),
				cpf: generate(),
				password: faker.internet.password(),
				isPassenger: true,
				isDriver: false,
			};
			const driverData = {
				name: faker.person.fullName(),
				email: faker.internet.email(),
				cpf: generate(),
				carPlate: `${faker.string.alpha({ casing: "upper", length: 3 })}${faker.number.int({ min: 1000, max: 9999 })}`,
				password: faker.internet.password(),
				isPassenger: false,
				isDriver: true,
			};
			const passenger = await registry
				.inject(ACCOUNT_GATEWAY)
				.signup(passengerData);
			const driver = await registry.inject(ACCOUNT_GATEWAY).signup(driverData);

			const rideData = {
				fromLat: 90,
				fromLong: 0,
				toLat: 0,
				toLong: 90,
				passengerId: passenger.accountId,
			};
			const { rideId } = await requestRide.execute(rideData);
			await acceptRide.execute({ rideId, driverId: driver.accountId });
			await startRide.execute(rideId);
			const result = await rideRepository.findById(rideId);
			const startedRide = result?.toDto();
			expect(startedRide?.status).toBe("in progress");
			expect(startedRide?.driverId).toBe(driver.accountId);
		});
		test("driver should not start a ride that's not already accepted", async () => {
			const passengerData = {
				name: faker.person.fullName(),
				email: faker.internet.email(),
				cpf: generate(),
				password: faker.internet.password(),
				isPassenger: true,
				isDriver: false,
			};
			const passenger = await registry
				.inject(ACCOUNT_GATEWAY)
				.signup(passengerData);

			const rideData = {
				fromLat: 90,
				fromLong: 0,
				toLat: 0,
				toLong: 90,
				passengerId: passenger.accountId,
			};
			const { rideId } = await requestRide.execute(rideData);
			const promise = startRide.execute(rideId);
			expect(promise).rejects.toThrow(new Error(Messages.NOT_STARTABLE));
		});
	});
});
