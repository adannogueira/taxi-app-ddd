import type { PositionRepository } from "../../application/interfaces/PositionRepository.interface";
import { inject } from "../../common/Registry";
import { Position } from "../../domain/entities/Position";
import { Coordinate } from "../../domain/vos/Coordinate";
import { Id } from "../../domain/vos/Id";
import {
	WRITER_DB,
	type DatabaseConnection,
} from "../database/PostgresDatabase";

type DatabasePosition = {
	position_id: string;
	ride_id: string;
	lat: number;
	long: number;
	date: string;
};

export class PositionRepo implements PositionRepository {
	@inject(WRITER_DB)
	private readonly connection!: DatabaseConnection;

	async update(position: Position): Promise<void> {
		const positionDto = position.toDto();
		await this.connection.query(
			"insert into ccca.position (position_id, ride_id, lat, long, date) values ($1, $2, $3, $4, $5);",
			[
				positionDto.positionId,
				positionDto.rideId,
				positionDto.lat,
				positionDto.long,
				positionDto.date,
			],
		);
	}

	async listByRideId(rideId: string): Promise<Position[]> {
		const foundPositions = await this.connection.query<DatabasePosition>(
			"select * from ccca.position where ride_id = $1 order by date asc;",
			[rideId],
		);
		return foundPositions.map((position) => {
			return new Position(
				new Id(position.position_id),
				new Id(position.ride_id),
				new Coordinate(Number(position.lat), Number(position.long)),
				new Date(position.date),
			);
		});
	}
}
