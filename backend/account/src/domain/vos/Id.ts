import crypto from "node:crypto";

export class Id {
	private static readonly UUID_REGEX =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

	constructor(readonly value: string) {
		if (!Id.UUID_REGEX.test(value)) throw new Error("Invalid UUID");
	}

	static create() {
		return new Id(crypto.randomUUID());
	}
}
