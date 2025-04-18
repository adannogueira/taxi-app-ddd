import { faker } from "@faker-js/faker";
import { generate } from "@fnando/cpf";
import { Account, Messages } from "../../src/domain/entities/Account";

test("should not create a new driver with invalid licence plate", async () => {
	const userData = {
		name: faker.person.fullName(),
		email: faker.internet.email(),
		cpf: generate(),
		carPlate: `${faker.string.alpha(4)}${faker.number.int({ min: 100, max: 999 })}`,
		password: faker.internet.password(),
		isPassenger: false,
		isDriver: true,
	};

	expect(() => Account.create(userData)).toThrow(
		new Error(Messages.INVALID_PLATE),
	);
});

test("should not create a new user with an invalid name", async () => {
	const userData = {
		name: faker.string.symbol(),
		email: faker.internet.email(),
		cpf: generate(),
		password: faker.internet.password(),
		isPassenger: true,
		isDriver: false,
	};

	expect(() => Account.create(userData)).toThrow(
		new Error(Messages.INVALID_NAME),
	);
});

test("should not create a new user with an invalid email", async () => {
	const userData = {
		name: faker.person.fullName(),
		email: "invalid email.com",
		cpf: generate(),
		password: faker.internet.password(),
		isPassenger: true,
		isDriver: false,
	};

	expect(() => Account.create(userData)).toThrow(
		new Error(Messages.INVALID_EMAIL),
	);
});

test("should not create a new user with an invalid cpf", async () => {
	const userData = {
		name: faker.person.fullName(),
		email: faker.internet.email(),
		cpf: "11111111111",
		password: faker.internet.password(),
		isPassenger: true,
		isDriver: false,
	};

	expect(() => Account.create(userData)).toThrow(new Error("Invalid Cpf"));
});
