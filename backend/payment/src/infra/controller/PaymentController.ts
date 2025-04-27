import type { GetPaymentByRideId } from "../../application/GetPaymentByRideId";
import type { HttpServer } from "../http/HttpServer";

export class PaymentController {
	constructor(
		readonly httpServer: HttpServer,
		readonly getPaymentByRideId: GetPaymentByRideId,
	) {
		httpServer.register(
			"get",
			"/transactions/:rideId",
			async ({ rideId }: { rideId: string }) => {
				const output = await getPaymentByRideId.execute(rideId);
				return output;
			},
		);
	}
}
