import { Cpf } from "../vos/Cpf";
import { Id } from "../vos/Id";

export class Account {
	constructor(
		private readonly accountId: Id,
		private readonly name: string,
		private readonly email: string,
		private readonly cpf: Cpf,
		private readonly carPlate: string | null,
		private readonly passenger: boolean,
		private readonly driver: boolean,
		private readonly password: string,
	) {
		this.validateName(name);
		this.validateEmail(email);
		if (driver) this.validateCarPlate(carPlate);
	}

	getId() {
		return this.accountId;
	}

	isDriver() {
		return this.driver;
	}

	private validateName(name: string) {
		if (!name.match(/[a-zA-Z] [a-zA-Z]+/))
			throw new Error(Messages.INVALID_NAME);
	}

	private validateEmail(email: string) {
		if (!email.match(/^(.+)@(.+)$/)) throw new Error(Messages.INVALID_EMAIL);
	}

	private validateCarPlate(carPlate: string | null) {
		if (!carPlate) throw new Error(Messages.INVALID_PLATE);
		if (!carPlate?.match(/[A-Z]{3}[0-9]{4}/))
			throw new Error(Messages.INVALID_PLATE);
	}

	toDto() {
		return {
			accountId: this.accountId.value,
			name: this.name,
			email: this.email,
			cpf: this.cpf.value,
			carPlate: this.carPlate,
			isPassenger: this.passenger,
			isDriver: this.driver,
			password: this.password,
		};
	}

	static create(data: {
		name: string;
		email: string;
		cpf: string;
		carPlate?: string;
		isPassenger: boolean;
		isDriver: boolean;
		password: string;
	}) {
		return new Account(
			Id.create(),
			data.name,
			data.email,
			Cpf.create(data.cpf),
			data.carPlate ?? null,
			data.isPassenger,
			data.isDriver,
			data.password,
		);
	}
}

export enum Messages {
	USER_EXISTS = "User already exists",
	INVALID_NAME = 'Invalid "name" field',
	INVALID_EMAIL = 'Invalid "email" field',
	INVALID_CPF = 'Invalid "cpf" field',
	INVALID_PLATE = 'Invalid "carPlate" field',
	NOT_FOUND = "User not found",
}
