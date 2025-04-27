import pgPromise from "pg-promise";

export const DATABASE = Symbol("Database");

export class Database implements DatabaseConnection {
	constructor(
		private connection = pgPromise()(
			"postgres://postgres:postgres@localhost:5434/local",
		),
	) {}

	query<T>(statement: string, params: (string | number)[]): Promise<T[]> {
		return this.connection.query(statement, params);
	}

	async close() {
		await this.connection.$pool.end();
	}
}

export interface DatabaseConnection {
	query<T>(
		statement: string,
		params: (string | number | Date | boolean | null)[],
	): Promise<T[]>;
	close(): Promise<void>;
}
