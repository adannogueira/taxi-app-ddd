export const HTTP_CLIENT = Symbol("HttpClient");

export interface HttpClient {
	post<T>(url: string, body: unknown): Promise<T | null>;
	get<T>(url: string): Promise<T | null>;
}

export class FetchAdapter implements HttpClient {
	async post<T>(url: string, body: unknown): Promise<T | null> {
		try {
			const result = await fetch(url, {
				method: "post",
				body: JSON.stringify(body),
				headers: { "content-type": "application/json" },
				signal: AbortSignal.timeout(9000),
			});
			if (!result.ok) return null;
			return await (<T>result?.json());
		} catch (e) {
			return null;
		}
	}

	async get<T>(url: string): Promise<T | null> {
		try {
			const result = await fetch(url, { signal: AbortSignal.timeout(9000) });
			if (!result.ok) return null;
			return await (<T>result?.json());
		} catch (e) {
			return null;
		}
	}
}
