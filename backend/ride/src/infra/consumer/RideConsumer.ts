import {
	RIDE_PROJECTOR,
	type RideProjector,
} from "../../application/projectors/RideProjector";
import { inject } from "../../common/Registry";
import { QUEUE, type Queue } from "../queue/Queue";

export class RideConsumer {
	@inject(QUEUE)
	private readonly queue!: Queue;
	@inject(RIDE_PROJECTOR)
	private readonly projector!: RideProjector;

	async start() {
		await this.queue.consume(
			"PaymentProcessed.updateProjection",
			async (input: any) => {
				await this.projector.onPaymentProcessed(input);
			},
		);
	}
}
