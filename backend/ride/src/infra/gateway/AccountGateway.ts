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
