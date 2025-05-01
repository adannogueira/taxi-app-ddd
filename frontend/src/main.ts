import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import {
	ACCOUNT_GATEWAY,
	AccountGatewayHttp,
} from "./infra/gateway/AccountGateway";
import { FetchAdapter } from "./infra/http/HttpClient";

const app = createApp(App);
const accountGateway = new AccountGatewayHttp(new FetchAdapter());
app.provide(ACCOUNT_GATEWAY, accountGateway);
app.mount("#app");
