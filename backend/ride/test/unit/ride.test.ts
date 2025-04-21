import { Ride } from "../../src/domain/entities/Ride";
import { Id } from "../../src/domain/vos/Id";

test("should accept a ride", async () => {
	const rideData = {
		fromLat: 90,
		fromLong: 0,
		toLat: 0,
		toLong: 90,
		passengerId: Id.create().value,
	};
	const driverId = Id.create();
	const ride = Ride.create(rideData);
	ride.confirmDriverAcceptance(driverId);
	const rideDto = ride.toDto();
	expect(rideDto.status).toBe("accepted");
	expect(ride.getDriverId()).toEqual(driverId);
});

test("should not start a ride that was'nt accepted", async () => {
	const rideData = {
		fromLat: 90,
		fromLong: 0,
		toLat: 0,
		toLong: 90,
		passengerId: Id.create().value,
	};
	const ride = Ride.create(rideData);
	expect(ride.isAwaitingDriver()).toBeTruthy();
	expect(() => ride.start()).toThrow(
		new Error("To start a ride it must be accepted first"),
	);
});

test("should start an accepted ride", async () => {
	const rideData = {
		fromLat: 90,
		fromLong: 0,
		toLat: 0,
		toLong: 90,
		passengerId: Id.create().value,
	};
	const driverId = Id.create();
	const ride = Ride.create(rideData);
	expect(ride.isAwaitingDriver()).toBeTruthy();
	ride.confirmDriverAcceptance(driverId);
	expect(ride.isAwaitingDriver()).toBeFalsy();
	expect(ride.getDriverId()).toEqual(driverId);
	expect(() => ride.start()).not.toThrow();
	expect(ride.isInProgress()).toBeTruthy();
});
