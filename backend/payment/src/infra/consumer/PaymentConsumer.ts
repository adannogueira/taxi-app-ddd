import {
	PROCESS_PAYMENT,
	type ProcessPayment,
} from "../../application/ProcessPayment";
import { inject } from "../../common/Registry";
import { QUEUE, type Queue } from "../queue/Queue";

export class PaymentConsumer {
	@inject(QUEUE)
	private readonly queue!: Queue;
	@inject(PROCESS_PAYMENT)
	private readonly processPayment!: ProcessPayment;

	async start() {
		await this.queue.consume(
			"RideFinished.processPayment",
			async (input: any) => {
				await this.processPayment.execute(input);
			},
		);
	}
}
