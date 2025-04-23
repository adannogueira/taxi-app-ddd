import { DomainEvent } from "../../common/DomainEvent";
import { Id } from "../vos/Id";

export class RideRequested extends DomainEvent {
	private readonly id: Id;

	constructor(readonly data: RequestedRideData) {
		super();
		this.id = Id.create();
	}

	identify(): string {
		return this.id.value;
	}

	message() {
		return JSON.stringify({
			rideId: this.data.rideId,
			passengerId: this.data.passengerId,
		});
	}
}

type RequestedRideData = {
	rideId: string;
	passengerId: string;
	driverId: string | null;
	status: "requested" | "accepted" | "in progress" | "completed";
	fare: number;
	distance: number;
	fromLat: number;
	fromLong: number;
	toLat: number;
	toLong: number;
	date: Date;
};
