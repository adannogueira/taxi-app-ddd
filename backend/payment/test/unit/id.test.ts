import { faker } from "@faker-js/faker";
import { test, expect } from "bun:test";
import { Id } from "../../src/domain/vos/Id";

test.each(Array(10).fill(faker.string.uuid()))(
	"Should instanciate an Id correctly with value %s",
	(idValue: string) => {
		const id = new Id(idValue);
		expect(id).toBeInstanceOf(Id);
		expect(id.value).toBe(idValue);
	},
);

test("Should generate a new Id", () => {
	const id = Id.create();
	expect(id).toBeInstanceOf(Id);
	expect(id.value).toEqual(expect.any(String));
});

test("Should throw error when value is not an UUID", () => {
	expect(() => new Id(faker.string.alphanumeric())).toThrow();
});
