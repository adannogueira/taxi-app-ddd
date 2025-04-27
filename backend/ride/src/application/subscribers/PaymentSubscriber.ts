import { inject } from "../../common/Registry";
import type { RideFinished } from "../../domain/events/RideFinished";
import { QUEUE, type Queue } from "../../infra/queue/Queue";

export class PaymentSubscriber {
	@inject(QUEUE)
	private readonly queue!: Queue;

	async onRideFinished(event: RideFinished): Promise<void> {
		this.queue.publish(event);
	}
}
