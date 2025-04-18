import { test, expect } from "bun:test";
import { Cpf } from "../../src/domain/vos/Cpf";

test.each(["97456321558", "974.563.215-58", "71428793860", "87748248800"])(
	"Should create a Cpf correctly with value %s",
	(cpfValue: string) => {
		const cpf = new Cpf(cpfValue);
		expect(cpf).toBeInstanceOf(Cpf);
	},
);

test("Should clean the Cpf value", () => {
	const cpf = new Cpf("974.563.215-58");
	expect(cpf).toBeInstanceOf(Cpf);
	expect(cpf.value).toBe("97456321558");
});

test.each([null, undefined, "", "11111111111"])(
	"Não deve validar o cpf %s",
	(cpf: string | null | undefined) => {
		expect(() => new Cpf(cpf as string)).toThrow();
	},
);
