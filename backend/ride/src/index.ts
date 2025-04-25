import { RequestRide } from "./application/commands/RequestRide";
import { GetRideById } from "./application/queries/GetRideById";
import { RideRepo } from "./infra/repository/RideRepository";
import {
	WRITER_DB,
	Database,
	READER_DB,
} from "./infra/database/PostgresDatabase";
import { ElysiaAdapter } from "./infra/http/HttpServer";
import { RideController } from "./infra/controller/RideController";
import { AcceptRide } from "./application/commands/AcceptRide";
import { StartRide } from "./application/commands/StartRide";
import {
	ACCOUNT_GATEWAY,
	AccountGatewayHttp,
} from "./infra/gateway/AccountGateway";
import { FetchAdapter, HTTP_CLIENT } from "./infra/http/HttpClient";
import { FinishRide } from "./application/commands/FinishRide";
import { PositionRepo } from "./infra/repository/PositionRepository";
import { QUEUE, RabbitMQAdapter } from "./infra/queue/Queue";
import { UpdatePosition } from "./application/commands/UpdatePosition";
import { Registry } from "./common/Registry";
import { RIDE_REPOSITORY } from "./application/interfaces/RideRepository.interface";
import { POSITION_REPOSITORY } from "./application/interfaces/PositionRepository.interface";
import {
	PAYMENT_GATEWAY,
	PaymentGatewayHttp,
} from "./infra/gateway/PaymentGateway";
import {
	DomainEventDispatcher,
	MEDIATOR,
} from "./infra/mediator/EventMediator";
import {
	RIDE_PROJECTOR,
	RideProjector,
} from "./application/projectors/RideProjector";
import { PaymentSubscriber } from "./application/subscribers/PaymentSubscriber";
import { RIDE_PROJECTION } from "./application/interfaces/RideProjection.interface";
import { RideProject } from "./infra/projections/RideProjection";
import { RideConsumer } from "./infra/consumer/RideConsumer";

async function main() {
	const httpServer = new ElysiaAdapter();
	const registry = Registry.getInstance();
	const writerConnection = new Database();
	const readerConnection = new Database(
		"postgres://postgres:postgres@localhost:5435/local",
	);
	const mediator = new DomainEventDispatcher();
	const queue = new RabbitMQAdapter();
	await queue.connect();
	registry.provide(WRITER_DB, writerConnection, true);
	registry.provide(READER_DB, readerConnection, true);
	registry.provide(HTTP_CLIENT, FetchAdapter);
	registry.provide(MEDIATOR, mediator, true);
	registry.provide(ACCOUNT_GATEWAY, AccountGatewayHttp);
	registry.provide(PAYMENT_GATEWAY, PaymentGatewayHttp);
	registry.provide(QUEUE, queue, true);
	registry.provide(RIDE_REPOSITORY, RideRepo);
	registry.provide(POSITION_REPOSITORY, PositionRepo);
	registry.provide(RIDE_PROJECTION, RideProject);
	registry.provide(RIDE_PROJECTOR, RideProjector);
	const requestRide = new RequestRide();
	const getRide = new GetRideById();
	const acceptRide = new AcceptRide();
	const startRide = new StartRide();
	const updatePosition = new UpdatePosition();
	const finishRide = new FinishRide();
	const rideProjector = new RideProjector();
	const paymentSubscriber = new PaymentSubscriber();
	const rideConsumer = new RideConsumer();
	mediator.register("RideRequested", (event: any) =>
		rideProjector.onRideRequested(event),
	);
	mediator.register("RideAccepted", (event: any) =>
		rideProjector.onRideAccepted(event),
	);
	mediator.register("RideFinished", (event: any) =>
		rideProjector.onRideFinished(event),
	);
	mediator.register("RideFinished", (event: any) =>
		paymentSubscriber.onRideFinished(event),
	);
	new RideController(
		httpServer,
		writerConnection,
		requestRide,
		getRide,
		acceptRide,
		startRide,
		finishRide,
		updatePosition,
	);

	await rideConsumer.start();
	httpServer.listen(4000);
}

main();
//export const app = httpServer.app;
