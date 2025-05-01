import { vi, describe, it, expect } from "vitest";
import { FormSignup } from "../src/domain/FormSignup";

describe("FormSignup", () => {
	it("should calculate the progress percentage", async () => {
		const form = new FormSignup();
		expect(form.calculateProgress()).toBe(0);
		expect(form.step).toBe(1);
		form.isPassenger = true;
		expect(form.calculateProgress()).toBe(25);

		form.next();
		expect(form.step).toBe(2);
		form.name = "Johnny Depp";
		expect(form.calculateProgress()).toBe(45);
		form.email = `johnnydepp${Math.random()}@gmail.com`;
		expect(form.calculateProgress()).toBe(65);
		form.cpf = "00000000191";
		expect(form.calculateProgress()).toBe(85);

		form.next();
		expect(form.step).toBe(3);
		form.password = "123456";
		expect(form.calculateProgress()).toBe(85);
		form.confirmPassword = "123";
		expect(form.calculateProgress()).toBe(85);
		form.confirmPassword = "123456";
		expect(form.calculateProgress()).toBe(100);

		form.previous();
		expect(form.step).toBe(2);
		form.previous();
		expect(form.step).toBe(1);
	});

	it("should only allow to advance steps when inputs are validated", async () => {
		const eventSpy = vi.fn();
		const form = new FormSignup();
		form.register("confirmed", eventSpy);
		form.next();
		expect(form.step).toBe(1);
		expect(form.error).toBe("Selecione o tipo de conta");
		form.isPassenger = true;
		form.next();
		expect(form.step).toBe(2);

		form.next();
		expect(form.step).toBe(2);
		expect(form.error).toBe("Informe o nome");
		form.name = "Johnny Depp";
		form.next();
		expect(form.step).toBe(2);
		expect(form.error).toBe("Informe o email");
		form.email = `johnnydepp${Math.random()}@gmail.com`;
		form.next();
		expect(form.step).toBe(2);
		expect(form.error).toBe("Informe o CPF");
		form.cpf = "00000000191";

		form.next();
		expect(form.step).toBe(3);
		form.confirm();
		expect(form.step).toBe(3);
		expect(form.error).toBe("Informe a senha");
		form.password = "123456";
		form.confirm();
		expect(form.step).toBe(3);
		expect(form.error).toBe("Informe a confirmação de senha");
		form.confirmPassword = "123";
		form.confirm();
		expect(form.step).toBe(3);
		expect(form.error).toBe("A senha e a confirmação precisam ser iguais");
		form.confirmPassword = "123456";
		form.confirm();
		expect(form.error).toBe("");
		expect(eventSpy).toHaveBeenCalled();
	});
});
