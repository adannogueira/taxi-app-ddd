import { describe, test, beforeEach, expect } from "bun:test";
import { faker } from "@faker-js/faker";
import { generate } from "@fnando/cpf";
import {
	RIDE_REPOSITORY,
	type RideRepository,
} from "../../src/application/interfaces/RideRepository.interface";
import { RequestRide } from "../../src/application/commands/RequestRide";
import {
	AcceptRide,
	Messages,
} from "../../src/application/commands/AcceptRide";
import { fakeRideRepository } from "./mocks/fakeRideRepository";
import { ACCOUNT_GATEWAY } from "../../src/infra/gateway/AccountGateway";
import { fakeAccountGateway } from "./mocks/fakeAccountGateway";
import { Registry } from "../../src/common/Registry";
import { Ride } from "../../src/domain/entities/Ride";

describe("AcceptRide", () => {
	let requestRide: RequestRide;
	let acceptRide: AcceptRide;
	let rideRepository: RideRepository;
	let registry: Registry;

	beforeEach(() => {
		registry = Registry.getInstance();
		rideRepository = new fakeRideRepository();
		registry.provide(ACCOUNT_GATEWAY, new fakeAccountGateway(), true);
		registry.provide(RIDE_REPOSITORY, rideRepository, true);
		requestRide = new RequestRide();
		acceptRide = new AcceptRide();
	});

	describe("execute()", () => {
		test("driver should accept a ride", async () => {
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
			await acceptRide.execute({
				rideId,
				driverId: driver.accountId,
			});
			const result = await rideRepository.findById(rideId);
			expect(result).toBeInstanceOf(Ride);
			const rideDto = result?.toDto();
			expect(rideDto?.status).toBe("accepted");
			expect(rideDto?.driverId).toBe(driver.accountId);
		});

		test("a passenger should not accept a ride", async () => {
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
			const promise = acceptRide.execute({
				rideId,
				driverId: passenger.accountId,
			});
			expect(promise).rejects.toThrow(new Error(Messages.NOT_DRIVER));
		});

		test("driver should not accept a ride if it's not awaiting for a driver", async () => {
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
			const promise = acceptRide.execute({
				rideId,
				driverId: driver.accountId,
			});
			expect(promise).rejects.toThrow(new Error(Messages.NOT_ACCEPTABLE));
		});

		test("driver should not accept a ride if currently in another ride", async () => {
			const passenger1Data = {
				name: faker.person.fullName(),
				email: faker.internet.email(),
				cpf: generate(),
				password: faker.internet.password(),
				isPassenger: true,
				isDriver: false,
			};
			const passenger2Data = {
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
			const passenger1 = await registry
				.inject(ACCOUNT_GATEWAY)
				.signup(passenger1Data);
			const passenger2 = await registry
				.inject(ACCOUNT_GATEWAY)
				.signup(passenger2Data);
			const driver = await registry.inject(ACCOUNT_GATEWAY).signup(driverData);

			const ride1Data = {
				fromLat: 90,
				fromLong: 0,
				toLat: 0,
				toLong: 90,
				passengerId: passenger1.accountId,
			};
			const ride2Data = {
				fromLat: 90,
				fromLong: 0,
				toLat: 0,
				toLong: 90,
				passengerId: passenger2.accountId,
			};
			const { rideId: ride1Id } = await requestRide.execute(ride1Data);
			const { rideId: ride2Id } = await requestRide.execute(ride2Data);
			await acceptRide.execute({ rideId: ride1Id, driverId: driver.accountId });
			const promise = acceptRide.execute({
				rideId: ride2Id,
				driverId: driver.accountId,
			});
			expect(promise).rejects.toThrow(new Error(Messages.ALREADY_DRIVING));
		});
	});
});
