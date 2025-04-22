import type { PositionRepository } from "../../../src/application/interfaces/PositionRepository.interface";
import type { Position } from "../../../src/domain/entities/Position";

export class fakePositionRepository implements PositionRepository {
	private positions: Position[] = [];

	async update(position: Position): Promise<void> {
		const positionIndex = this.positions.findIndex(
			(pos) => pos.toDto().positionId === position.toDto().positionId,
		);
		if (positionIndex !== -1) {
			this.positions[positionIndex] = position;
		} else {
			this.positions.push(position);
		}
		return Promise.resolve();
	}

	async listByRideId(rideId: string): Promise<Position[]> {
		return Promise.resolve(
			this.positions.filter((pos) => pos.toDto().rideId === rideId),
		);
	}
}
