import { describe, test, beforeEach, expect } from "bun:test";
import { faker } from "@faker-js/faker";
import {
	GetRideById,
	Messages,
} from "../../src/application/queries/GetRideById";
import { Registry } from "../../src/common/Registry";
import { RIDE_PROJECTION } from "../../src/application/interfaces/RideProjection.interface";
import { fakeRideProjection } from "./mocks/fakeRideProjection";

describe("GetRideById", () => {
	let getRideById: GetRideById;
	let registry: Registry;

	beforeEach(() => {
		registry = Registry.getInstance();
		registry.provide(RIDE_PROJECTION, new fakeRideProjection(), true);
		getRideById = new GetRideById();
	});

	describe("execute()", () => {
		test("should get ride data", async () => {
			const existingRide = registry.inject(RIDE_PROJECTION).factory();
			const ride = await getRideById.execute(existingRide.rideId);
			expect(ride).toBeDefined();
			expect(ride?.rideId).toEqual(existingRide.rideId);
			expect(ride?.status).toBe(existingRide.status);
		});

		test("should throw error when ride does not exist", async () => {
			expect(getRideById.execute(faker.string.uuid())).rejects.toThrow(
				new Error(Messages.NOT_FOUND),
			);
		});
	});
});
