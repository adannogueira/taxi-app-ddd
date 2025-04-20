import { describe, test, expect } from "bun:test";
import { faker } from "@faker-js/faker";
import { generate } from "@fnando/cpf";
import { treaty } from "@elysiajs/eden";
import { app } from "../../src";

const api: any = treaty(app);

describe("api", () => {
	test("should create a new driver", async () => {
		const { data } = await api.signup.post({
			name: faker.person.fullName(),
			email: faker.internet.email(),
			cpf: generate(),
			carPlate: `${faker.string.alpha({ casing: "upper", length: 3 })}${faker.number.int({ min: 1000, max: 9999 })}`,
			password: faker.internet.password(),
			isPassenger: false,
			isDriver: true,
		});

		expect(data?.accountId).toEqual(expect.any(String));
	});

	test("should not create a new user with an invalid data", async () => {
		const { error } = await api.signup.post({
			name: faker.string.symbol(),
			email: faker.internet.email(),
			cpf: generate(),
			password: faker.internet.password(),
			isPassenger: true,
			isDriver: false,
		});

		expect(error?.message).toBe('Invalid "name" field');
	});

	test("should get a registered user data", async () => {
		const userData = {
			name: faker.person.fullName(),
			email: faker.internet.email(),
			cpf: generate(),
			password: faker.internet.password(),
			isPassenger: true,
			isDriver: false,
		};
		const {
			data: { accountId },
		} = await api.signup.post(userData);
		const { data } = await api.users({ accountId }).get();
		expect(data).toEqual(
			expect.objectContaining({
				...userData,
				accountId,
				carPlate: null,
			}),
		);
	});

	test("should return empty when userId does not exist", async () => {
		const { error } = await api.users({ accountId: faker.string.uuid() }).get();
		expect(error?.message).toBe("User not found");
	});
});
