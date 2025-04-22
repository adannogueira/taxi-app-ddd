import { setSystemTime, describe, test, beforeEach, expect } from "bun:test";
import { faker } from "@faker-js/faker";
import { generate } from "@fnando/cpf";
import {
	RIDE_REPOSITORY,
	type RideRepository,
} from "../../src/application/interfaces/RideRepository.interface";
import {
	Messages,
	RequestRide,
} from "../../src/application/commands/RequestRide";
import { fakeRideRepository } from "./mocks/fakeRideRepository";
import { ACCOUNT_GATEWAY } from "../../src/infra/gateway/AccountGateway";
import { fakeAccountGateway } from "./mocks/fakeAccountGateway";
import { Registry } from "../../src/common/Registry";

describe("RequestRide", () => {
	let requestRide: RequestRide;
	let rideRepository: RideRepository;
	let registry: Registry;

	beforeEach(() => {
		registry = Registry.getInstance();
		rideRepository = new fakeRideRepository();
		registry.provide(ACCOUNT_GATEWAY, new fakeAccountGateway(), true);
		registry.provide(RIDE_REPOSITORY, rideRepository, true);
		requestRide = new RequestRide();
	});

	describe("execute()", () => {
		test("should request a new ride", async () => {
			setSystemTime(new Date("2025-01-01"));
			const now = new Date();
			const userData = {
				name: faker.person.fullName(),
				email: faker.internet.email(),
				cpf: generate(),
				password: faker.internet.password(),
				isPassenger: true,
				isDriver: false,
			};
			const passenger = await registry.inject(ACCOUNT_GATEWAY).signup(userData);

			const rideData = {
				fromLat: 90,
				fromLong: 0,
				toLat: 0,
				toLong: 90,
				passengerId: passenger.accountId,
			};
			const result = await requestRide.execute(rideData);
			expect(result?.rideId).toEqual(expect.any(String));
			const ride = await rideRepository.findById(result.rideId);
			const requestedRide = ride?.toDto();
			expect(requestedRide?.status).toBe("requested");
			expect(requestedRide?.date?.getTime()).toBe(now.getTime());
			setSystemTime();
		});

		test("should not request a ride if requester is not passenger", async () => {
			const userData = {
				name: faker.person.fullName(),
				email: faker.internet.email(),
				cpf: generate(),
				password: faker.internet.password(),
				carPlate: `${faker.string.alpha({ casing: "upper", length: 3 })}${faker.number.int({ min: 1000, max: 9999 })}`,
				isPassenger: false,
				isDriver: true,
			};
			const driver = await registry.inject(ACCOUNT_GATEWAY).signup(userData);

			const rideData = {
				fromLat: 90,
				fromLong: 0,
				toLat: 0,
				toLong: 90,
				passengerId: driver.accountId,
			};

			const promise = requestRide.execute(rideData);
			await expect(promise).rejects.toThrow(new Error(Messages.NOT_PASSENGER));
		});

		test("should not request a ride for a passenger with another ride in progress", async () => {
			const userData = {
				name: faker.person.fullName(),
				email: faker.internet.email(),
				cpf: generate(),
				password: faker.internet.password(),
				isPassenger: true,
				isDriver: false,
			};
			const passenger = await registry.inject(ACCOUNT_GATEWAY).signup(userData);

			const rideData = {
				fromLat: 90,
				fromLong: 0,
				toLat: 0,
				toLong: 90,
				passengerId: passenger.accountId,
			};

			await requestRide.execute(rideData);
			const promise = requestRide.execute(rideData);
			expect(promise).rejects.toThrow(new Error(Messages.ALREADY_IN_RIDE));
		});
	});
});
