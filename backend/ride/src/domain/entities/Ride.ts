import type { Position } from "./Position";
import { Coordinate } from "../vos/Coordinate";
import { Id } from "../vos/Id";
import { FareCalculatorFactory } from "../services/FareCalculator";
import { RideFinished } from "../events/RideFinished";
import type { DomainEvent } from "../../common/DomainEvent";
import { RideRequested } from "../events/RideRequested";
import { RideAccepted } from "../events/RideAccepted";

export class Ride {
	private readonly events: DomainEvent[] = [];

	constructor(
		private readonly rideId: Id,
		private readonly passengerId: Id,
		private driverId: Id | null,
		private status: "requested" | "accepted" | "in progress" | "completed",
		private fare: number,
		private distance: number,
		private readonly from: Coordinate,
		private readonly to: Coordinate,
		private readonly date: Date,
	) {}

	isActive() {
		return this.status !== "completed";
	}

	isAwaitingDriver() {
		return this.status === "requested";
	}

	isInProgress() {
		return this.status === "in progress";
	}

	confirmDriverAcceptance(driverId: Id) {
		this.driverId = driverId;
		this.status = "accepted";
		this.events.push(
			new RideAccepted({
				driverId: this.driverId.value,
				rideId: this.rideId.value,
				status: this.status,
			}),
		);
	}

	start() {
		if (this.status === "accepted") this.status = "in progress";
		else throw new Error("To start a ride it must be accepted first");
	}

	updateTravelledDistance(distanceToAdd: number) {
		if (Number.isNaN(distanceToAdd) || distanceToAdd < 0)
			throw new Error("Invalid distance");
		this.distance += distanceToAdd;
	}

	finish(positions: Position[]) {
		if (this.status !== "in progress")
			throw new Error("Can't finish a ride that's not in progress");
		for (const [index, pastPosition] of positions.entries()) {
			const currentCoordinates = positions[index + 1]?.getCoordinates();
			if (!currentCoordinates) break;
			const distance = pastPosition.distanceUntil(currentCoordinates);
			this.fare += FareCalculatorFactory.create(
				pastPosition.getDate(),
			).calculate(distance);
		}
		this.status = "completed";
		this.events.push(
			new RideFinished({
				rideId: this.rideId.value,
				amount: this.fare,
				distance: this.distance,
				status: this.status,
			}),
		);
	}

	emittedEvents() {
		return this.events;
	}

	getTotalFare() {
		return this.fare;
	}

	identify() {
		return this.rideId;
	}

	getPassengerId() {
		return this.passengerId;
	}

	getDriverId() {
		return this.driverId;
	}

	getOrigin() {
		return this.from.toDto();
	}

	getDestination() {
		return this.to.toDto();
	}

	toDto() {
		return {
			rideId: this.rideId.value,
			passengerId: this.passengerId.value,
			driverId: this.driverId?.value ?? null,
			status: this.status,
			fare: this.fare,
			distance: this.distance,
			fromLat: this.from.getLatitude(),
			fromLong: this.from.getLongitude(),
			toLat: this.to.getLatitude(),
			toLong: this.to.getLongitude(),
			date: this.date,
		};
	}

	static create(data: {
		passengerId: string;
		fromLat: number;
		fromLong: number;
		toLat: number;
		toLong: number;
	}) {
		const requestedRide = new Ride(
			Id.create(),
			new Id(data.passengerId),
			null,
			"requested",
			0,
			0,
			new Coordinate(data.fromLat, data.fromLong),
			new Coordinate(data.toLat, data.toLong),
			new Date(),
		);
		requestedRide.events.push(new RideRequested(requestedRide.toDto()));
		return requestedRide;
	}
}
