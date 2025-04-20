import pgPromise from "pg-promise";

export const DATABASE = Symbol("Database");

export class Database implements DatabaseConnection {
	private readonly connection;
	private static connection: Database | null;

	static connect(url?: string) {
		if (!Database.connection) {
			Database.connection = new Database(url);
		}
		return Database.connection;
	}

	static getConnection() {
		if (!Database.connection) {
			Database.connect();
		}
		return Database.connection as Database;
	}

	constructor(url?: string) {
		this.connection = pgPromise()(
			url || "postgres://postgres:postgres@localhost:5432/local",
		);
	}

	async transact(): Promise<void> {
		await this.connection.none("BEGIN TRANSACTION;");
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
		Database.connection = null;
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
