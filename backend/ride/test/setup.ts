import { Registry } from "../src/common/Registry";
import { WRITER_DB } from "../src/infra/database/PostgresDatabase";

const mockDb = {
	query: () => {},
	close: () => {},
	transact: () => {},
	commit: () => {},
	rollback: () => {},
};

Registry.getInstance().provide(WRITER_DB, mockDb, true);
