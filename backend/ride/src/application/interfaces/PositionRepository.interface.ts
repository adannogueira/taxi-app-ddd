import type { Position } from "../../domain/entities/Position";

export const POSITION_REPOSITORY = Symbol("PositionRepository");

export type PositionRepository = {
	update: (position: Position) => Promise<void>;
	listByRideId: (rideId: string) => Promise<Position[]>;
};
