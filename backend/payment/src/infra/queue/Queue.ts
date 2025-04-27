import amqplib from "amqplib";
import type { DomainEvent } from "../../common/DomainEvent";

export const QUEUE = Symbol("Queue");

export interface Queue {
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	publish(domainEvent: DomainEvent): void;
	consume(event: string, callback: Function): Promise<void>;
}

export class RabbitMQAdapter implements Queue {
	private connection: amqplib.ChannelModel | undefined;
	private channel: amqplib.Channel | undefined;

	async connect(): Promise<void> {
		this.connection = await amqplib.connect("amqp://localhost");
		this.channel = await this.connection.createChannel();
		console.info("Queue connected");
	}

	publish(domainEvent: DomainEvent): void {
		if (!this.connection || !this.channel)
			throw new Error("Queue is not connected");
		const published = this.channel.publish(
			domainEvent.name(),
			"",
			Buffer.from(domainEvent.message()),
			{ persistent: true },
		);
		published
			? console.info(`Message ${domainEvent.message()} published`)
			: console.info(`Message failed to publish`);
	}

	async consume(event: string, callback: Function): Promise<void> {
		this.channel?.consume(event, async (message: any) => {
			if (!this.channel)
				throw new Error("Channel not open to consume messages");
			this.channel.prefetch(1);
			try {
				const input = JSON.parse(message.content.toString());
				console.info(input);
				await callback(input);
				this.channel.ack(message);
				console.info(`Message ${input} acknowledged`);
			} catch (e) {
				this.channel.reject(message, false);
			}
		});
	}

	async disconnect() {
		await this.connection?.close();
	}
}
