import { describe, test, beforeEach, expect } from "bun:test";
import { faker } from "@faker-js/faker";
import { generate } from "@fnando/cpf";
import { Messages, Signup } from "../../src/application/Signup";
import { fakeUserRepository } from "./mocks/fakeAccountRepository";
import { Registry } from "../../src/common/Registry";
import { ACCOUNT_REPOSITORY } from "../../src/application/repositories/AccountRepository.interface";

describe("Signup", () => {
	let signup: Signup;

	beforeEach(() => {
		Registry.getInstance().provide(ACCOUNT_REPOSITORY, new fakeUserRepository(), true)
		signup = new Signup();
	});
	describe("execute()", () => {
		test("should create a new passenger", async () => {
			const userData = {
				name: faker.person.fullName(),
				email: faker.internet.email(),
				cpf: generate(),
				password: faker.internet.password(),
				isPassenger: true,
				isDriver: false,
			};

			const result = await signup.execute(userData);
			expect(result?.accountId).toEqual(expect.any(String));
		});

		test("should create a new driver", async () => {
			const userData = {
				name: faker.person.fullName(),
				email: faker.internet.email(),
				cpf: generate(),
				carPlate: `${faker.string.alpha({ casing: "upper", length: 3 })}${faker.number.int({ min: 1000, max: 9999 })}`,
				password: faker.internet.password(),
				isPassenger: false,
				isDriver: true,
			};

			const result = await signup.execute(userData);
			expect(result?.accountId).toEqual(expect.any(String));
		});

		test("should not create a new user with an email already registered", async () => {
			const userData = {
				name: faker.person.fullName(),
				email: faker.internet.email(),
				cpf: generate(),
				password: faker.internet.password(),
				isPassenger: true,
				isDriver: false,
			};

			await signup.execute(userData);
			expect(signup.execute(userData)).rejects.toThrow(
				new Error(Messages.USER_EXISTS),
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

			expect(signup.execute(userData)).rejects.toThrow(
				new Error('Invalid "name" field'),
			);
		});
	});
});
