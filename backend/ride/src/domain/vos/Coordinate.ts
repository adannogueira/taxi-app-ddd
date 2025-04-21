export class Coordinate {
	constructor(
		private readonly lat: number,
		private readonly long: number,
	) {
		if (lat < -90 || lat > 90) throw new Error("Invalid lat");
		if (long < -180 || long > 180) throw new Error("Invalid long");
	}

	getLatitude() {
		return this.lat;
	}

	getLongitude() {
		return this.long;
	}

	toDto() {
		return { lat: this.lat, long: this.long };
	}
}
