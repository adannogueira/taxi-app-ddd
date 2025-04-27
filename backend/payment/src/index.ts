import { GetPaymentByRideId } from "./application/GetPaymentByRideId";
import { PROCESS_PAYMENT, ProcessPayment } from "./application/ProcessPayment";
import { PAYMENT_REPOSITORY } from "./application/repositories/PaymentRepository.interface";
import { Registry } from "./common/Registry";
import { PaymentConsumer } from "./infra/consumer/PaymentConsumer";
import { PaymentController } from "./infra/controller/PaymentController";
import { DATABASE, Database } from "./infra/database/PostgresDatabase";
import { ElysiaAdapter } from "./infra/http/HttpServer";
import { QUEUE, RabbitMQAdapter } from "./infra/queue/Queue";
import { PaymentRepo } from "./infra/repository/PaymentRepository";

async function main() {
	const httpServer = new ElysiaAdapter();
	const registry = Registry.getInstance();
	const connection = new Database();
	const queue = new RabbitMQAdapter();
	await queue.connect();
	registry.provide(DATABASE, connection, true);
	registry.provide(QUEUE, queue, true);
	registry.provide(DATABASE, connection, true);
	registry.provide(PROCESS_PAYMENT, ProcessPayment);
	registry.provide(PAYMENT_REPOSITORY, PaymentRepo);
	const paymentConsumer = new PaymentConsumer();
	const getPaymentByRideId = new GetPaymentByRideId();
	new PaymentController(httpServer, getPaymentByRideId);

	await paymentConsumer.start();
	httpServer.listen(5000);
}

main();
