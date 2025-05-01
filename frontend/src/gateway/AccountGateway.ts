import type { HttpClient } from "../http/HttpClient";

export const ACCOUNT_GATEWAY = Symbol("AccountGateway");

export interface AccountGateway {
	signup(data: Input): Promise<Output>;
}

type Input = {
	name: string;
	email: string;
	cpf: string;
	password: string;
	isPassenger: boolean;
};

type Output = {
	accountId: string;
};

export class AccountGatewayHttp implements AccountGateway {
	constructor(private readonly httpClient: HttpClient) {}

	async signup(data: Input): Promise<Output> {
		const result = await this.httpClient.post<Output>(
			"http://localhost:3000/signup",
			{
				name: data.name,
				email: data.email,
				cpf: data.cpf,
				password: data.password,
				isPassenger: data.isPassenger,
			},
		);
		if (!result?.accountId) throw new Error();
		return { accountId: result.accountId };
	}
}

export class AccountGatewayMemory implements AccountGateway {
	async signup(_: Input): Promise<Output> {
		return Promise.resolve({
			accountId: "01968cac-6453-719b-8bd7-6c11ced07e0c",
		});
	}
}
