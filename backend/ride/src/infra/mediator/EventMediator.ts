import type { DomainEvent } from "../../common/DomainEvent";

export const MEDIATOR = Symbol("Mediator");

export interface Mediator {
	register(event: string, callback: Function): void;
	dispatch(event: DomainEvent): void;
}

export class DomainEventDispatcher implements Mediator {
	private readonly handlers: { event: string; callback: Function }[] = [];

	register(event: string, callback: Function): void {
		this.handlers.push({ event, callback });
	}

	dispatch(event: DomainEvent): void {
		for (const handler of this.handlers) {
			if (handler.event === event.name()) handler.callback(event);
		}
	}
}
