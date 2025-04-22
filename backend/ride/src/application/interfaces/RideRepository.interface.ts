import type { Ride } from "../../domain/entities/Ride";

export const RIDE_REPOSITORY = Symbol("RideRepository");

export type RideRepository = {
	findByPassengerId: (passengerId: string) => Promise<Ride | null>;
	findActiveByDriverId: (driverId: string) => Promise<Ride | null>;
	findById: (rideId: string) => Promise<Ride | null>;
	persist: (rideData: Ride) => Promise<void>;
	update: (ride: Ride) => Promise<void>;
};
