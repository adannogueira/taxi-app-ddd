import { describe, test, beforeEach, expect } from "bun:test";
import { PAYMENT_REPOSITORY } from "../../src/application/repositories/PaymentRepository.interface";
import { ProcessPayment } from "../../src/application/ProcessPayment";
import { fakePaymentRepository } from "./mocks/fakePaymentRepository";
import { randomUUIDv7 } from "bun";
import { ApplicationError } from "../../src/application/ApplicationError";
import { Registry } from "../../src/common/Registry";

describe("ProcessPayment", () => {
	let processPayment: ProcessPayment;
	let registry: Registry;

	beforeEach(() => {
		registry = Registry.getInstance();
		registry.provide(PAYMENT_REPOSITORY, new fakePaymentRepository(), true);
		processPayment = new ProcessPayment();
	});
	describe("execute()", () => {
		test("should create a new payment", async () => {
			const paymentData = {
				rideId: randomUUIDv7(),
				amount: 10,
			};

			const result = await processPayment.execute(paymentData);
			expect(result?.transactionId).toEqual(expect.any(String));
		});

		test("should not create a new payment with an invalid amount", async () => {
			const paymentData = {
				rideId: randomUUIDv7(),
				amount: 0,
			};

			const promise = processPayment.execute(paymentData);
			expect(promise).rejects.toThrow(
				new ApplicationError("Invalid amount", 422),
			);
		});
	});
});
