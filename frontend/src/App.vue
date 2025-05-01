<script setup lang="ts">
import { inject, ref } from "vue";
import {
	ACCOUNT_GATEWAY,
	type AccountGateway,
} from "./infra/gateway/AccountGateway";
import { FormSignup } from "./domain/FormSignup";

const accountGateway = inject(ACCOUNT_GATEWAY) as AccountGateway;
const form = ref(new FormSignup());
form.value.register("confirmed", async (data: any) => {
	const result = await accountGateway.signup(data);
	form.value.success = result.accountId;
});
</script>

<template>
	<div>
		<div>
			<span class="span-step">{{ form.step }}</span>
		</div>
		<div>
			<span>Progresso </span>
			<span class="span-progress">{{ form.calculateProgress() }}%</span>
		</div>
		<div>
			<span>Erro </span>
			<span class="span-error">{{ form.error }}</span>
		</div>
		<div>
			<span>Sucesso </span>
			<span v-if="form.success" class="span-success">{{ form.success }}</span>
		</div>
	</div>
	<div v-if="form.step === 1">
		<span>Passageiro </span>
		<input type="checkbox" class="input-is-passenger" v-model="form.isPassenger"/>
	</div>
	<div v-if="form.step === 2">
		<div>
			<span>Nome </span>
			<input type="text" class="input-name" v-model="form.name">
		</div>
		<div>
			<span>Email </span>
			<input type="email" class="input-email" v-model="form.email">
		</div>
		<div>
			<span>CPF </span>
			<input type="text" class="input-cpf" v-model="form.cpf">
		</div>
	</div>
	<div v-if="form.step === 3">
		<div>
			<span>Senha </span>
			<input type="password" class="input-password" v-model="form.password">
		</div>
		<div>
			<span>Confirmação de senha </span>
			<input type="password" class="input-confirm-password" v-model="form.confirmPassword">
		</div>
	</div>
	<div v-if="form.step > 1">
		<button class="button-previous" @click="form.previous()">Anterior</button>
	</div>
	<div v-if="form.step < 3">
		<button class="button-next" @click="form.next()">Próximo</button>
	</div>
	<div v-if="form.step === 3">
		<button class="button-confirm" @click="form.confirm()">Confirmar</button>
	</div>
</template>

<style scoped>
</style>
