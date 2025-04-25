import cors from "@elysiajs/cors";
import Elysia from "elysia";
import { ApplicationError } from "../../application/errors/ApplicationError";

export interface HttpServer {
	register<T, R>(
		method: string,
		url: string,
		callback: (data: T) => Promise<R>,
	): void;
	listen(port: number): void;
}

export class ElysiaAdapter implements HttpServer {
	readonly app: Elysia;

	constructor() {
		this.app = new Elysia().use(cors());
	}
	register<T, R>(
		method: "post" | "get",
		url: string,
		callback: (data: T) => Promise<R>,
	): void {
		this.app[method](url, async ({ body, params, error }) => {
			try {
				const output = await callback({ ...((body || {}) as T), ...params });
				return output;
			} catch (e) {
				if (e && e instanceof ApplicationError) {
					return error(e.status, e.message);
				}
				console.error(e);
				return error("Internal Server Error");
			}
		});
	}
	listen(port: number): void {
		this.app.listen(port);
		console.log(
			`🦊 Elysia is running at ${this.app.server?.hostname}:${this.app.server?.port}`,
		);
	}
}
