import type { Account } from "../../domain/entities/Account";

export const ACCOUNT_REPOSITORY = Symbol("AccountRepository");

export interface AccountRepository {
	findByEmail(email: string): Promise<Account | null>;
	findById(accountId: string): Promise<Account | null>;
	persist(userData: Account): Promise<void>;
}
