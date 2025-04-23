import pgPromise from "pg-promise";

export const WRITER_DB = Symbol("WDatabase");
export const READER_DB = Symbol("RDatabase");

export class Database implements DatabaseConnection {
	private readonly connection;

	constructor(url?: string) {
		this.connection = pgPromise()(
			url || "postgres://postgres:postgres@localhost:5433/local",
		);
	}

	async transact(): Promise<void> {
		await this.connection.none("BEGIN;");
	}
	async commit(): Promise<void> {
		await this.connection.none("COMMIT;");
	}
	async rollback(): Promise<void> {
		await this.connection.none("ROLLBACK;");
	}

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
	transact(): Promise<void>;
	commit(): Promise<void>;
	rollback(): Promise<void>;
}
