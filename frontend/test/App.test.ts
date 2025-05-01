import { describe, it, expect, beforeEach } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import App from "../src/App.vue";
import {
	ACCOUNT_GATEWAY,
	AccountGatewayMemory,
} from "../src/gateway/AccountGateway";

const sleep = (time: number) => {
	return new Promise((resolve) => setTimeout(() => resolve(true), time));
};
describe("Signup Wizard Page", () => {
	let wrapper: VueWrapper;
	beforeEach(() => {
		wrapper = mount(App, {
			global: {
				provide: {
					[ACCOUNT_GATEWAY]: new AccountGatewayMemory(),
				},
			},
		});
	});

	it("should exhibit the progress percentage", async () => {
		expect(wrapper.get(".span-progress").text()).toBe("0%");
		expect(wrapper.get(".span-step").text()).toBe("1");
		await wrapper.get(".input-is-passenger").setValue(true);
		expect(wrapper.get(".span-progress").text()).toBe("25%");

		await wrapper.get(".button-next").trigger("click");
		expect(wrapper.get(".span-step").text()).toBe("2");
		await wrapper.get(".input-name").setValue("Johnny Depp");
		expect(wrapper.get(".span-progress").text()).toBe("45%");
		await wrapper
			.get(".input-email")
			.setValue(`johnnydepp${Math.random()}@gmail.com`);
		expect(wrapper.get(".span-progress").text()).toBe("65%");
		await wrapper.get(".input-cpf").setValue("00000000191");
		expect(wrapper.get(".span-progress").text()).toBe("85%");

		await wrapper.get(".button-next").trigger("click");
		expect(wrapper.get(".span-step").text()).toBe("3");
		await wrapper.get(".input-password").setValue("123456");
		expect(wrapper.get(".span-progress").text()).toBe("85%");
		await wrapper.get(".input-confirm-password").setValue("123");
		expect(wrapper.get(".span-progress").text()).toBe("85%");
		await wrapper.get(".input-confirm-password").setValue("123456");
		expect(wrapper.get(".span-progress").text()).toBe("100%");

		await wrapper.get(".button-previous").trigger("click");
		expect(wrapper.get(".span-step").text()).toBe("2");
		await wrapper.get(".button-previous").trigger("click");
		expect(wrapper.get(".span-step").text()).toBe("1");
	});

	it("should show only one step at a time", async () => {
		expect(wrapper.find(".input-is-passenger").exists()).toBeTruthy();
		expect(wrapper.find(".input-name").exists()).toBeFalsy();
		expect(wrapper.find(".input-email").exists()).toBeFalsy();
		expect(wrapper.find(".input-cpf").exists()).toBeFalsy();
		expect(wrapper.find(".input-password").exists()).toBeFalsy();
		expect(wrapper.find(".input-confirm-password").exists()).toBeFalsy();
		expect(wrapper.find(".button-next").exists()).toBeTruthy();
		expect(wrapper.find(".button-previous").exists()).toBeFalsy();
		expect(wrapper.find(".button-confirm").exists()).toBeFalsy();
		await wrapper.get(".input-is-passenger").setValue(true);

		await wrapper.get(".button-next").trigger("click");
		expect(wrapper.find(".input-is-passenger").exists()).toBeFalsy();
		expect(wrapper.find(".input-name").exists()).toBeTruthy();
		expect(wrapper.find(".input-email").exists()).toBeTruthy();
		expect(wrapper.find(".input-cpf").exists()).toBeTruthy();
		expect(wrapper.find(".input-password").exists()).toBeFalsy();
		expect(wrapper.find(".input-confirm-password").exists()).toBeFalsy();
		expect(wrapper.find(".button-next").exists()).toBeTruthy();
		expect(wrapper.find(".button-previous").exists()).toBeTruthy();
		expect(wrapper.find(".button-confirm").exists()).toBeFalsy();
		await wrapper.get(".input-name").setValue("Johnny Depp");
		expect(wrapper.get(".span-progress").text()).toBe("45%");
		await wrapper
			.get(".input-email")
			.setValue(`johnnydepp${Math.random()}@gmail.com`);
		await wrapper.get(".input-cpf").setValue("00000000191");

		await wrapper.get(".button-next").trigger("click");
		expect(wrapper.find(".input-is-passenger").exists()).toBeFalsy();
		expect(wrapper.find(".input-name").exists()).toBeFalsy();
		expect(wrapper.find(".input-email").exists()).toBeFalsy();
		expect(wrapper.find(".input-cpf").exists()).toBeFalsy();
		expect(wrapper.find(".input-password").exists()).toBeTruthy();
		expect(wrapper.find(".input-confirm-password").exists()).toBeTruthy();
		expect(wrapper.find(".button-next").exists()).toBeFalsy();
		expect(wrapper.find(".button-confirm").exists()).toBeTruthy();
		expect(wrapper.find(".button-previous").exists()).toBeTruthy();
	});

	it("should only allow to continue when inputs are validated", async () => {
		await wrapper.get(".button-next").trigger("click");
		expect(wrapper.get(".span-step").text()).toBe("1");
		expect(wrapper.get(".span-error").text()).toBe("Selecione o tipo de conta");
		await wrapper.get(".input-is-passenger").setValue(true);
		await wrapper.get(".button-next").trigger("click");
		expect(wrapper.get(".span-step").text()).toBe("2");

		await wrapper.get(".button-next").trigger("click");
		expect(wrapper.get(".span-step").text()).toBe("2");
		expect(wrapper.get(".span-error").text()).toBe("Informe o nome");
		await wrapper.get(".input-name").setValue("Johnny Depp");
		await wrapper.get(".button-next").trigger("click");
		expect(wrapper.get(".span-step").text()).toBe("2");
		expect(wrapper.get(".span-error").text()).toBe("Informe o email");
		expect(wrapper.get(".span-progress").text()).toBe("45%");
		await wrapper
			.get(".input-email")
			.setValue(`johnnydepp${Math.random()}@gmail.com`);
		await wrapper.get(".button-next").trigger("click");
		expect(wrapper.get(".span-step").text()).toBe("2");
		expect(wrapper.get(".span-error").text()).toBe("Informe o CPF");
		await wrapper.get(".input-cpf").setValue("00000000191");

		await wrapper.get(".button-next").trigger("click");
		expect(wrapper.get(".span-step").text()).toBe("3");
		await wrapper.get(".button-confirm").trigger("click");
		expect(wrapper.get(".span-step").text()).toBe("3");
		expect(wrapper.get(".span-error").text()).toBe("Informe a senha");
		await wrapper.get(".input-password").setValue("123456");
		await wrapper.get(".button-confirm").trigger("click");
		expect(wrapper.get(".span-step").text()).toBe("3");
		expect(wrapper.get(".span-error").text()).toBe(
			"Informe a confirmação de senha",
		);
		await wrapper.get(".input-confirm-password").setValue("123");
		await wrapper.get(".button-confirm").trigger("click");
		expect(wrapper.get(".span-step").text()).toBe("3");
		expect(wrapper.get(".span-error").text()).toBe(
			"A senha e a confirmação precisam ser iguais",
		);
		await wrapper.get(".input-confirm-password").setValue("123456");
		await wrapper.get(".button-confirm").trigger("click");
		expect(wrapper.get(".span-error").text()).toBe("");
	});

	it("should send account data to the backend", async () => {
		await wrapper.get(".input-is-passenger").setValue(true);
		await wrapper.get(".button-next").trigger("click");
		await wrapper.get(".input-name").setValue("Johnny Depp");
		await wrapper
			.get(".input-email")
			.setValue(`johnnydepp${Math.random()}@gmail.com`);
		await wrapper.get(".input-cpf").setValue("00000000191");
		await wrapper.get(".button-next").trigger("click");
		await wrapper.get(".input-password").setValue("123456");
		await wrapper.get(".input-confirm-password").setValue("123456");
		await wrapper.get(".button-confirm").trigger("click");
		await sleep(200);
		expect(wrapper.find(".span-success").exists()).toBeTruthy();
	});
});
