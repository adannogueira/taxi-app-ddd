import { Coordinate } from "../vos/Coordinate";
import { Id } from "../vos/Id";

export class Position {
	constructor(
		private readonly positionId: Id,
		private readonly rideId: Id,
		private readonly coordinate: Coordinate,
		private readonly date: Date,
	) {}

	distanceUntil(position: Coordinate) {
		const earthRadius = 6371;
		const degreesToRadians = Math.PI / 180;
		const deltaLat =
			(position.getLatitude() - this.coordinate.getLatitude()) *
			degreesToRadians;
		const deltaLon =
			(position.getLongitude() - this.coordinate.getLongitude()) *
			degreesToRadians;
		const a =
			Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
			Math.cos(this.coordinate.getLatitude() * degreesToRadians) *
				Math.cos(position.getLatitude() * degreesToRadians) *
				Math.sin(deltaLon / 2) *
				Math.sin(deltaLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const distance = earthRadius * c;
		return Math.round(distance);
	}

	getCoordinates() {
		return this.coordinate;
	}

	getDate() {
		return this.date;
	}

	toDto() {
		return {
			positionId: this.positionId.value,
			rideId: this.rideId.value,
			lat: this.coordinate.getLatitude(),
			long: this.coordinate.getLongitude(),
			date: this.date,
		};
	}

	static create(data: {
		rideId: Id;
		lat: number;
		long: number;
	}) {
		return new Position(
			Id.create(),
			data.rideId,
			new Coordinate(data.lat, data.long),
			new Date(),
		);
	}
}
