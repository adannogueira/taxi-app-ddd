import { randomUUIDv7 } from "bun";
import { Payment } from "../../src/domain/entities/Payment";

test("should create a successful payment", async () => {
	const paymentData = {
		rideId: randomUUIDv7(),
		amount: 10,
	};

	const payment = Payment.create(paymentData);
	expect(payment.getStatus()).toBe("success");
});

test("should not create payment with invalid amount", async () => {
	const paymentData = {
		rideId: randomUUIDv7(),
		amount: 0,
	};

	expect(() => Payment.create(paymentData)).toThrow(
		new Error("Invalid amount"),
	);
});
