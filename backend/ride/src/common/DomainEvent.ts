export abstract class DomainEvent {
	name(): string {
		return this.constructor.name;
	}

	abstract identify(): string;
	abstract message(): string;
}
