import {
	DATABASE,
	type DatabaseConnection,
} from "../database/PostgresDatabase";
import type { AccountRepository } from "../../application/repositories/AccountRepository.interface";
import { Account } from "../../domain/entities/Account";
import { Cpf } from "../../domain/vos/Cpf";
import { Id } from "../../domain/vos/Id";
import { inject } from "../../common/Registry";

type DatabaseAccount = {
	account_id: string;
	name: string;
	email: string;
	cpf: string;
	car_plate: string;
	is_passenger: boolean;
	is_driver: boolean;
	password: string;
};

export class AccountRepo implements AccountRepository {
	@inject(DATABASE)
	private readonly connection!: DatabaseConnection;

	async findByEmail(email: string): Promise<Account | null> {
		const [foundUser] = await this.connection.query<DatabaseAccount>(
			"select * from ccca.account where email = $1;",
			[email],
		);
		return foundUser
			? new Account(
					new Id(foundUser.account_id),
					foundUser.name,
					foundUser.email,
					new Cpf(foundUser.cpf),
					foundUser.car_plate,
					foundUser.is_passenger,
					foundUser.is_driver,
					foundUser.password,
				)
			: null;
	}

	async findById(accountId: string): Promise<Account | null> {
		const [foundUser] = await this.connection.query<DatabaseAccount>(
			"select * from ccca.account where account_id = $1;",
			[accountId],
		);
		return foundUser
			? new Account(
					new Id(foundUser.account_id),
					foundUser.name,
					foundUser.email,
					new Cpf(foundUser.cpf),
					foundUser.car_plate,
					foundUser.is_passenger,
					foundUser.is_driver,
					foundUser.password,
				)
			: null;
	}

	async persist(accountData: Account): Promise<void> {
		const accountDto = accountData.toDto();
		await this.connection.query(
			"insert into ccca.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver, password) values ($1, $2, $3, $4, $5, $6, $7, $8);",
			[
				accountDto.accountId,
				accountDto.name,
				accountDto.email,
				accountDto.cpf,
				accountDto.carPlate,
				accountDto.isPassenger,
				accountDto.isDriver,
				accountDto.password,
			],
		);
	}
}
