import type { AccountRepository } from "../../../src/application/repositories/AccountRepository.interface";
import type { Account } from "../../../src/domain/entities/Account";

export class fakeUserRepository implements AccountRepository {
	private users: Account[] = [];

	async findByEmail(email: string): Promise<Account | null> {
		return Promise.resolve(
			this.users.find((user) => user.toDto().email === email) || null,
		);
	}
	async findById(accountId: string): Promise<Account | null> {
		return Promise.resolve(
			this.users.find((user) => user.getId().value === accountId) || null,
		);
	}
	persist(userData: Account): Promise<void> {
		this.users.push(userData);
		return Promise.resolve();
	}
}