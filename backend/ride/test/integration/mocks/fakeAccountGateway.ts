import { randomUUIDv7 } from "bun";
import type {
	AccountDto,
	AccountGateway,
	SignupInput,
} from "../../../src/infra/gateway/AccountGateway";

export class fakeAccountGateway implements AccountGateway {
	private users: AccountDto[] = [];

	signup(data: SignupInput): Promise<{ accountId: string }> {
		const account = {
			carPlate: null,
			isPassenger: true,
			isDriver: false,
			...data,
			accountId: randomUUIDv7(),
		};
		this.users.push(account);
		return Promise.resolve({ accountId: account.accountId });
	}

	findById(accountId: string): Promise<AccountDto | null> {
		const account = this.users.find((user) => user.accountId === accountId);
		return Promise.resolve(account || null);
	}
}
