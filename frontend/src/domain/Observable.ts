export class Observable {
	constructor(
		private readonly handlers: { event: string; callback: Function }[] = [],
	) {}

	register(event: string, callback: Function) {
		this.handlers.push({ event, callback });
	}

	async notifyAll({
		data,
		event,
	}: { event: string; data: Record<string, any> }) {
		for (const handler of this.handlers) {
			if (handler.event === event) await handler.callback(data);
		}
	}
}
