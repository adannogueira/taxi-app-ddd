export interface DomainEvent {
	name(): string;
	message(): string;
}
