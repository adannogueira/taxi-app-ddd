import { Database } from "./PostgresDatabase";

export function transactional(
	target: unknown,
	propertyKey: string,
	descriptor: PropertyDescriptor,
) {
	const originalMethod = descriptor.value;
	descriptor.value = async function (...args: unknown[]) {
		const connection = Database.getConnection();
		try {
			await connection.transact();
			const result = await originalMethod.apply(this, args);
			await connection.commit();
			return result;
		} catch (error) {
			await connection.rollback();
			throw error;
		}
	};
}
