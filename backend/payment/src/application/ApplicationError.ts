export class ApplicationError extends Error {
	constructor(
		override readonly message: string,
		readonly status: number,
	) {
		super(message);
	}
}
