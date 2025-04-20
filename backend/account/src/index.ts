import { Signup } from "./application/Signup";
import { GetUserById } from "./application/GetUserById";
import { AccountRepo } from "./infra/repository/AccountRepository";
import { DATABASE, Database } from "./infra/database/PostgresDatabase";
import { ElysiaAdapter } from "./infra/http/HttpServer";
import { AccountController } from "./infra/controller/AccountController";
import { Registry } from "./common/Registry";
import { ACCOUNT_REPOSITORY } from "./application/repositories/AccountRepository.interface";

const httpServer = new ElysiaAdapter();
const registry = Registry.getInstance();
const connection = Database.connect();
registry.provide(DATABASE, connection, true);
registry.provide(ACCOUNT_REPOSITORY, AccountRepo);
const signUp = new Signup();
const getAccount = new GetUserById();
new AccountController(httpServer, signUp, getAccount);

httpServer.listen(3000);

export const app = httpServer.app;
