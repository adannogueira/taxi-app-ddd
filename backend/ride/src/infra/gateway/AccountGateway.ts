import { inject } from "../../common/Registry";
import { HTTP_CLIENT, type HttpClient } from "../http/HttpClient";

export const ACCOUNT_GATEWAY = Symbol("AccountGateway");

export interface AccountGateway {
	signup(data: SignupInput): Promise<{ accountId: string } | null>;
	findById(accountId: string): Promise<AccountDto | null>;
}

export type SignupInput = {
	name: string;
	email: string;
	cpf: string;
	carPlate?: string;
	isPassenger?: boolean;
	isDriver?: boolean;
	password: string;
};
export type AccountDto = {
	accountId: string;
	name: string;
	email: string;
	cpf: string;
	carPlate: string | null;
	isPassenger: boolean;
	isDriver: boolean;
	password: string;
};

export class AccountGatewayHttp implements AccountGateway {
	@inject(HTTP_CLIENT)
	private readonly httpClient!: HttpClient;

	async signup(data: SignupInput): Promise<{ accountId: string } | null> {
		const output = await this.httpClient.post<{ accountId: string }>(
			"http://localhost:3000/signup",
			data,
		);
		if (!output) return null;
		return { accountId: output.accountId };
	}

	async findById(accountId: string): Promise<AccountDto | null> {
		const output = await this.httpClient.get<AccountDto>(
			`http://localhost:3000/users/${accountId}`,
		);
		if (!output) return null;
		return {
			accountId: output.accountId,
			carPlate: output.carPlate,
			cpf: output.cpf,
			email: output.email,
			isDriver: output.isDriver,
			isPassenger: output.isPassenger,
			name: output.name,
			password: output.password,
		};
	}
}
