import { describe, test, beforeEach, expect } from "bun:test";
import { faker } from "@faker-js/faker";
import { generate } from "@fnando/cpf";
import { RequestRide } from "../../src/application/commands/RequestRide";
import { AcceptRide } from "../../src/application/commands/AcceptRide";
import { StartRide } from "../../src/application/commands/StartRide";
import {
	Messages,
	UpdatePosition,
} from "../../src/application/commands/UpdatePosition";
import {
	POSITION_REPOSITORY,
	type PositionRepository,
} from "../../src/application/interfaces/PositionRepository.interface";
import { fakeRideRepository } from "./mocks/fakeRideRepository";
import { fakePositionRepository } from "./mocks/fakePositionRepository";
import { fakeAccountGateway } from "./mocks/fakeAccountGateway";
import { Registry } from "../../src/common/Registry";
import { ACCOUNT_GATEWAY } from "../../src/infra/gateway/AccountGateway";
import {
	RIDE_REPOSITORY,
	type RideRepository,
} from "../../src/application/interfaces/RideRepository.interface";

describe("UpdatePosition", () => {
	let requestRide: RequestRide;
	let acceptRide: AcceptRide;
	let startRide: StartRide;
	let updatePosition: UpdatePosition;
	let registry: Registry;
	let rideRepository: RideRepository;
	let positionRepository: PositionRepository;

	beforeEach(() => {
		registry = Registry.getInstance();
		rideRepository = new fakeRideRepository();
		positionRepository = new fakePositionRepository();
		registry.provide(ACCOUNT_GATEWAY, new fakeAccountGateway(), true);
		registry.provide(RIDE_REPOSITORY, rideRepository, true);
		registry.provide(POSITION_REPOSITORY, positionRepository, true);
		requestRide = new RequestRide();
		acceptRide = new AcceptRide();
		startRide = new StartRide();
		updatePosition = new UpdatePosition();
	});

	describe("execute()", () => {
		test("should not update position for a ride that's not in progress", async () => {
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
			const promise = updatePosition.execute({ rideId, lat: 10, long: 10 });
			expect(promise).rejects.toThrow(new Error(Messages.RIDE_NOT_IN_PROGRESS));
		});

		test("should update a ride's position and distance", async () => {
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
				fromLat: -27.584905257808835,
				fromLong: -48.545022195325124,
				toLat: -27.496887588317275,
				toLong: -48.522234807851476,
				passengerId: passenger.accountId,
			};
			const { rideId } = await requestRide.execute(rideData);
			let ride = await rideRepository.findById(rideId);
			expect(ride?.toDto().distance).toBe(0);
			await acceptRide.execute({ rideId, driverId: driver.accountId });
			await startRide.execute(rideId);
			await updatePosition.execute({
				rideId,
				lat: -27.584905257808835,
				long: -48.545022195325124,
			});
			await updatePosition.execute({
				rideId,
				lat: -27.496887588317275,
				long: -48.522234807851476,
			});
			const result = await positionRepository.listByRideId(rideId);
			ride = await rideRepository.findById(rideId);
			const position = result[0]?.toDto();
			expect(ride?.toDto().distance).toBe(10);
			expect(result).toHaveLength(2);
			expect(position?.positionId).toEqual(expect.any(String));
			expect(position?.rideId).toBe(rideId);
			expect(position?.date).toBeInstanceOf(Date);
			expect(position?.lat).toBe(-27.584905257808835);
			expect(position?.long).toBe(-48.545022195325124);
		});
	});
});
