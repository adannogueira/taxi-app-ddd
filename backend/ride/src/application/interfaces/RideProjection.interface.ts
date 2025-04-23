export const RIDE_PROJECTION = Symbol("RideProjection");

export interface RideProjection {
	findById: (rideId: string) => Promise<RideProjectionDto | null>;
}

export type RideProjectionDto = {
	rideId: string;
	passengerName: string | null;
	driverName: string | null;
	fare: number;
	distance: number;
	status: string;
	paymentId: string | null;
	paymentStatus: string;
};
