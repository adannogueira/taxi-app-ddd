import { describe, test, beforeEach, expect } from "bun:test";
import { faker } from "@faker-js/faker";
import { generate } from "@fnando/cpf";
import { GetUserById, Messages } from "../../src/application/GetUserById";
import { Signup } from "../../src/application/Signup";
import { fakeUserRepository } from "./mocks/fakeAccountRepository";
import { Registry } from "../../src/common/Registry";
import { ACCOUNT_REPOSITORY } from "../../src/application/repositories/AccountRepository.interface";

describe("GetUserById", () => {
	let getUserById: GetUserById;
	let signup: Signup;

	beforeEach(() => {
		Registry.getInstance().provide(ACCOUNT_REPOSITORY, new fakeUserRepository(), true)
		getUserById = new GetUserById();
		signup = new Signup();
	});

	describe("execute()", () => {
		test("should get a registered user data", async () => {
			const userData = {
				name: faker.person.fullName(),
				email: faker.internet.email(),
				cpf: generate(),
				password: faker.internet.password(),
				isPassenger: true,
				isDriver: false,
			};
			const { accountId } = await signup.execute(userData);
			const result = await getUserById.execute(accountId);
			expect(result).toEqual(
				expect.objectContaining({ ...userData, accountId }),
			);
		});

		test("should throw error when userId does not exist", async () => {
			expect(getUserById.execute(faker.string.uuid())).rejects.toThrow(
				new Error(Messages.NOT_FOUND),
			);
		});
	});
});
