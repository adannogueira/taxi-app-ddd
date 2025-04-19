import { inject } from "../common/Registry";
import type { UseCase } from "../common/UseCase";
import { Account } from "../domain/entities/Account";
import { ApplicationError } from "./ApplicationError";
import { ACCOUNT_REPOSITORY, type AccountRepository } from "./repositories/AccountRepository.interface";

export class Signup implements UseCase<Input, Output> {
	@inject(ACCOUNT_REPOSITORY)
	private readonly accountRepository!: AccountRepository;

	async execute(data: Input): Promise<{ accountId: string }> {
		try {
			const account = Account.create({
				carPlate: data.carPlate,
				cpf: data.cpf,
				email: data.email,
				isDriver: data.isDriver,
				isPassenger: data.isPassenger,
				name: data.name,
				password: data.password,
			});
			const existingUser = await this.accountRepository.findByEmail(data.email);
			if (existingUser) throw new ApplicationError(Messages.USER_EXISTS, 409);
			await this.accountRepository.persist(account);
			return { accountId: account.getId().value };
		} catch (e) {
			if (
				e &&
				typeof e === "object" &&
				"message" in e &&
				typeof e.message === "string"
			)
				throw new ApplicationError(e.message, 422);
			throw e;
		}
	}
}

export enum Messages {
	USER_EXISTS = "User already exists",
}

export type Input = {
	name: string;
	email: string;
	cpf: string;
	carPlate?: string;
	isPassenger: boolean;
	isDriver: boolean;
	password: string;
};

export type Output = { accountId: string }