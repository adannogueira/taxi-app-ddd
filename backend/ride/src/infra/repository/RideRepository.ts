import type { RideRepository } from "../../application/interfaces/RideRepository.interface";
import type { DomainEvent } from "../../common/DomainEvent";
import { inject } from "../../common/Registry";
import { Ride } from "../../domain/entities/Ride";
import { Coordinate } from "../../domain/vos/Coordinate";
import { Id } from "../../domain/vos/Id";
import {
	WRITER_DB,
	type DatabaseConnection,
} from "../database/PostgresDatabase";
import { MEDIATOR, type Mediator } from "../mediator/EventMediator";

type DatabaseRide = {
	ride_id: string;
	passenger_id: string;
	driver_id: string | null;
	status: "requested" | "in progress" | "completed";
	fare: number;
	distance: number;
	from_lat: number;
	from_long: number;
	to_lat: number;
	to_long: number;
	date: string;
};

export class RideRepo implements RideRepository {
	@inject(WRITER_DB)
	private readonly connection!: DatabaseConnection;
	@inject(MEDIATOR)
	private readonly mediator!: Mediator;

	async findActiveByDriverId(driverId: string): Promise<Ride | null> {
		const [foundRide] = await this.connection.query<DatabaseRide>(
			"select * from ccca.ride where driver_id = $1 and status <> 'completed'",
			[driverId],
		);
		return foundRide
			? new Ride(
					new Id(foundRide.ride_id),
					new Id(foundRide.passenger_id),
					new Id(foundRide.driver_id!),
					foundRide.status,
					Number(foundRide.fare),
					Number(foundRide.distance),
					new Coordinate(
						Number(foundRide.from_lat),
						Number(foundRide.from_long),
					),
					new Coordinate(Number(foundRide.to_lat), Number(foundRide.to_long)),
					new Date(foundRide.date),
				)
			: null;
	}

	async update(ride: Ride): Promise<void> {
		const rideDto = ride.toDto();
		await this.connection.query(
			"update ccca.ride set passenger_id = $1, driver_id = $2, status = $3, fare = $4, distance = $5, from_lat = $6, from_long = $7, to_lat = $8, to_long = $9, date = $10 where ride_id = $11",
			[
				rideDto.passengerId,
				rideDto.driverId,
				rideDto.status,
				rideDto.fare,
				rideDto.distance,
				rideDto.fromLat,
				rideDto.fromLong,
				rideDto.toLat,
				rideDto.toLong,
				rideDto.date,
				rideDto.rideId,
			],
		);
		await this.persistEvents(ride.emittedEvents());
	}

	async findById(rideId: string): Promise<Ride | null> {
		const [foundRide] = await this.connection.query<DatabaseRide>(
			"select * from ccca.ride where ride_id = $1",
			[rideId],
		);
		return foundRide
			? new Ride(
					new Id(foundRide.ride_id),
					new Id(foundRide.passenger_id),
					foundRide.driver_id ? new Id(foundRide.driver_id) : null,
					foundRide.status,
					Number(foundRide.fare),
					Number(foundRide.distance),
					new Coordinate(
						Number(foundRide.from_lat),
						Number(foundRide.from_long),
					),
					new Coordinate(Number(foundRide.to_lat), Number(foundRide.to_long)),
					new Date(foundRide.date),
				)
			: null;
	}

	async findByPassengerId(passengerId: string): Promise<Ride | null> {
		const [foundRide] = await this.connection.query<DatabaseRide>(
			"select * from ccca.ride where passenger_id = $1",
			[passengerId],
		);
		return foundRide
			? new Ride(
					new Id(foundRide.ride_id),
					new Id(foundRide.passenger_id),
					foundRide.driver_id ? new Id(foundRide.driver_id) : null,
					foundRide.status,
					Number(foundRide.fare),
					Number(foundRide.distance),
					new Coordinate(
						Number(foundRide.from_lat),
						Number(foundRide.from_long),
					),
					new Coordinate(Number(foundRide.to_lat), Number(foundRide.to_long)),
					new Date(foundRide.date),
				)
			: null;
	}

	async persist(ride: Ride): Promise<void> {
		const rideDto = ride.toDto();
		await this.connection.query(
			`insert into ccca.ride (ride_id, passenger_id, driver_id, status, fare, distance, from_lat, from_long, to_lat, to_long, date)
				values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
			[
				rideDto.rideId,
				rideDto.passengerId,
				rideDto.driverId,
				rideDto.status,
				rideDto.fare,
				rideDto.distance,
				rideDto.fromLat,
				rideDto.fromLong,
				rideDto.toLat,
				rideDto.toLong,
				rideDto.date,
			],
		);
		await this.persistEvents(ride.emittedEvents());
	}

	private async persistEvents(events: DomainEvent[]): Promise<void> {
		if (!events.length) return;
		for (const event of events) {
			await this.connection.query(
				"insert into ccca.events (event_id, name, message, date, published, published_at) values ($1, $2, $3, $4, $5, $6);",
				[
					event.identify(),
					event.name(),
					event.message(),
					new Date(),
					false,
					null,
				],
			);
			this.mediator.dispatch(event);
		}
	}
}
