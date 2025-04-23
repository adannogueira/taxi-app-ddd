import type {
	Input as AcceptRideInput,
	AcceptRide,
} from "../../application/commands/AcceptRide";
import type { FinishRide } from "../../application/commands/FinishRide";
import type {
	Input as RequestRideInput,
	RequestRide,
} from "../../application/commands/RequestRide";
import type { StartRide } from "../../application/commands/StartRide";
import type {
	UpdatePosition,
	Input as UpdatePositionInput,
} from "../../application/commands/UpdatePosition";
import type { Database } from "../database/PostgresDatabase";
import type { HttpServer } from "../http/HttpServer";

export class RideController {
	constructor(
		readonly httpServer: HttpServer,
		readonly connection: Database,
		readonly requestRide: RequestRide,
		readonly acceptRide: AcceptRide,
		readonly startRide: StartRide,
		readonly finishRide: FinishRide,
		readonly updatePosition: UpdatePosition,
	) {
		httpServer.register(
			"post",
			"/request-ride",
			async (data: RequestRideInput) => {
				const output = await requestRide.execute(data);
				return output;
			},
		);

		httpServer.register(
			"post",
			"/rides/:rideId/accept",
			async (data: AcceptRideInput) => {
				const output = await acceptRide.execute(data);
				return output;
			},
		);

		httpServer.register(
			"post",
			"/rides/:rideId/start",
			async ({ rideId }: { rideId: string }) => {
				const output = await startRide.execute(rideId);
				return output;
			},
		);

		httpServer.register(
			"post",
			"/rides/:rideId/update",
			async (data: UpdatePositionInput) => {
				const output = await updatePosition.execute(data);
				return output;
			},
		);

		httpServer.register(
			"post",
			"/rides/:rideId/finish",
			async ({ rideId }: { rideId: string }) => {
				const output = await finishRide.execute(rideId);
				return output;
			},
		);
	}
}
