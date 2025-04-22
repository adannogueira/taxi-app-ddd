import { describe, test, beforeEach, expect, setSystemTime } from "bun:test";
import { faker } from "@faker-js/faker";
import { generate } from "@fnando/cpf";
import {
	RIDE_REPOSITORY,
	type RideRepository,
} from "../../src/application/interfaces/RideRepository.interface";
import { RequestRide } from "../../src/application/commands/RequestRide";
import { AcceptRide } from "../../src/application/commands/AcceptRide";
import { StartRide } from "../../src/application/commands/StartRide";
import { fakeRideRepository } from "./mocks/fakeRideRepository";
import { UpdatePosition } from "../../src/application/commands/UpdatePosition";
import { fakePositionRepository } from "./mocks/fakePositionRepository";
import { POSITION_REPOSITORY } from "../../src/application/interfaces/PositionRepository.interface";
import {
	Messages,
	FinishRide,
} from "../../src/application/commands/FinishRide";
import { ACCOUNT_GATEWAY } from "../../src/infra/gateway/AccountGateway";
import { fakeAccountGateway } from "./mocks/fakeAccountGateway";
import { Registry } from "../../src/common/Registry";

describe("FinishRide", () => {
	let requestRide: RequestRide;
	let acceptRide: AcceptRide;
	let startRide: StartRide;
	let updatePosition: UpdatePosition;
	let finishRide: FinishRide;
	let registry: Registry;
	let rideRepository: RideRepository;

	beforeEach(() => {
		registry = Registry.getInstance();
		rideRepository = new fakeRideRepository();
		registry.provide(ACCOUNT_GATEWAY, new fakeAccountGateway(), true);
		registry.provide(RIDE_REPOSITORY, rideRepository, true);
		registry.provide(POSITION_REPOSITORY, new fakePositionRepository(), true);
		requestRide = new RequestRide();
		acceptRide = new AcceptRide();
		startRide = new StartRide();
		updatePosition = new UpdatePosition();
		finishRide = new FinishRide();
	});

	describe("execute()", () => {
		test("driver should finish a ride and calculate fare", async () => {
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
			setSystemTime(new Date("2025-03-28T09:50:00"));
			const passenger = await registry
				.inject(ACCOUNT_GATEWAY)
				.signup(passengerData);
			const driver = await registry.inject(ACCOUNT_GATEWAY).signup(driverData);

			const rideData = {
				fromLat: -19.922592920516532,
				fromLong: -43.9190577896977,
				toLat: -19.95834979959613,
				toLong: -43.94735663546245,
				passengerId: passenger.accountId,
			};
			const { rideId } = await requestRide.execute(rideData);
			await acceptRide.execute({ rideId, driverId: driver.accountId });
			setSystemTime(new Date("2025-03-28T10:00:00"));
			await startRide.execute(rideId);
			await updatePosition.execute({
				lat: -19.922592920516532,
				long: -43.9190577896977,
				rideId,
			});
			setSystemTime(new Date("2025-03-28T10:10:00"));
			await updatePosition.execute({
				lat: -19.88100999394684,
				long: -43.938305587626765,
				rideId,
			});
			setSystemTime(new Date("2025-03-28T10:20:00"));
			await updatePosition.execute({
				lat: -19.91893061459713,
				long: -43.97107267219647,
				rideId,
			});
			setSystemTime(new Date("2025-03-28T10:30:00"));
			await updatePosition.execute({
				lat: -19.95834979959613,
				long: -43.94735663546245,
				rideId,
			});
			await finishRide.execute(rideId);
			const result = await rideRepository.findById(rideId);
			const finishedRide = result?.toDto();
			expect(finishedRide?.status).toBe("completed");
			expect(finishedRide?.distance).toBe(15);
			expect(finishedRide?.fare).toBe(31.5);
			setSystemTime();
		});

		test("driver should finish a ride and calculate night fare", async () => {
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
			setSystemTime(new Date("2025-03-28T22:50:00"));
			const passenger = await registry
				.inject(ACCOUNT_GATEWAY)
				.signup(passengerData);
			const driver = await registry.inject(ACCOUNT_GATEWAY).signup(driverData);

			const rideData = {
				fromLat: -19.922592920516532,
				fromLong: -43.9190577896977,
				toLat: -19.95834979959613,
				toLong: -43.94735663546245,
				passengerId: passenger.accountId,
			};
			const { rideId } = await requestRide.execute(rideData);
			await acceptRide.execute({ rideId, driverId: driver.accountId });
			setSystemTime(new Date("2025-03-28T23:00:00"));
			await startRide.execute(rideId);
			await updatePosition.execute({
				lat: -19.922592920516532,
				long: -43.9190577896977,
				rideId,
			});
			setSystemTime(new Date("2025-03-28T23:10:00"));
			await updatePosition.execute({
				lat: -19.88100999394684,
				long: -43.938305587626765,
				rideId,
			});
			setSystemTime(new Date("2025-03-28T23:20:00"));
			await updatePosition.execute({
				lat: -19.91893061459713,
				long: -43.97107267219647,
				rideId,
			});
			setSystemTime(new Date("2025-03-28T23:30:00"));
			await updatePosition.execute({
				lat: -19.95834979959613,
				long: -43.94735663546245,
				rideId,
			});
			await finishRide.execute(rideId);
			const result = await rideRepository.findById(rideId);
			const finishedRide = result?.toDto();
			expect(finishedRide?.status).toBe("completed");
			expect(finishedRide?.distance).toBe(15);
			expect(finishedRide?.fare).toBe(58.5);
			setSystemTime();
		});

		test("driver should not finish a ride that's not in progress", async () => {
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
			const promise = finishRide.execute(rideId);
			expect(promise).rejects.toThrow(new Error(Messages.NOT_IN_PROGRESS));
		});
	});
});
