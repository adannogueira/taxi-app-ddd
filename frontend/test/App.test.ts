import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import App from "../src/App.vue";

describe("Signup Wizard Page", () => {
	it("should exhibit the progress percentage", async () => {
		const wrapper = mount(App, { global: { stubs: {} } });
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
	});
});
