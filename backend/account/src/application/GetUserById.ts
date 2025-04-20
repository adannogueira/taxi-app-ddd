import { inject } from "../common/Registry";
import type { UseCase } from "../common/UseCase";
import { ApplicationError } from "./ApplicationError";
import {
	ACCOUNT_REPOSITORY,
	type AccountRepository,
} from "./repositories/AccountRepository.interface";

export class GetUserById implements UseCase<string, Output> {
	@inject(ACCOUNT_REPOSITORY)
	private readonly accountRepository!: AccountRepository;

	async execute(accountId: string): Promise<Output> {
		const foundUser = await this.accountRepository.findById(accountId);
		if (foundUser) return foundUser.toDto();
		throw new ApplicationError(Messages.NOT_FOUND, 404);
	}
}

export enum Messages {
	NOT_FOUND = "User not found",
}

export type Output = {
	accountId: string;
	name: string;
	email: string;
	cpf: string;
	carPlate: string | null;
	isPassenger: boolean;
	isDriver: boolean;
	password: string;
};
