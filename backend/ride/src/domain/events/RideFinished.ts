import { DomainEvent } from "../../common/DomainEvent";
import { Id } from "../vos/Id";

export class RideFinished extends DomainEvent {
	private readonly id: Id;

	constructor(
		readonly data: {
			rideId: string;
			amount: number;
			distance: number;
			status: string;
		},
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
			amount: this.data.amount,
		});
	}
}
