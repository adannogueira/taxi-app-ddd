import type { GetUserById } from "../../application/GetUserById";
import type { Input, Signup } from "../../application/Signup";
import type { HttpServer } from "../http/HttpServer";

export class AccountController {
	constructor(
		readonly httpServer: HttpServer,
		readonly signup: Signup,
		readonly getAccount: GetUserById,
	) {
		httpServer.register("post", "/signup", async (data: Input) => {
			const output = await signup.execute(data);
			return output;
		});

		httpServer.register(
			"get",
			"/users/:accountId",
			async ({ accountId }: { accountId: string }) => {
				const output = await getAccount.execute(accountId);
				return output;
			},
		);
	}
}
