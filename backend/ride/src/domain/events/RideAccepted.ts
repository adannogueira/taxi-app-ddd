import { DomainEvent } from "../../common/DomainEvent";
import { Id } from "../vos/Id";

export class RideAccepted extends DomainEvent {
	private readonly id: Id;

	constructor(
		readonly data: { rideId: string; driverId: string; status: string },
	) {
		super();
		this.id = Id.create();
	}

	identify(): string {
		return this.id.value;
	}

	message() {
		return JSON.stringify({
			rideId: this.data.rideId,
			driverId: this.data.driverId,
			status: this.data.status,
		});
	}
}
