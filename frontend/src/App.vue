<script setup lang="ts">
import { inject, ref } from "vue";
import { ACCOUNT_GATEWAY, type AccountGateway } from "./gateway/AccountGateway";

const accountGateway = inject(ACCOUNT_GATEWAY) as AccountGateway;

const form = ref({
	name: "",
	email: "",
	cpf: "",
	password: "",
	confirmPassword: "",
	isPassenger: false,
	step: 1,
	error: "",
	success: "",
});

function calculateProgress() {
	let progress = 0;
	if (form.value.isPassenger) progress += 25;
	if (form.value.name) progress += 20;
	if (form.value.email) progress += 20;
	if (form.value.cpf) progress += 20;
	if (
		form.value.password &&
		form.value?.password === form.value?.confirmPassword
	)
		progress += 15;
	return progress;
}

function validate() {
	if (form.value.step === 1 && !form.value.isPassenger) {
		form.value.error = "Selecione o tipo de conta";
		return false;
	}
	if (form.value.step === 2) {
		if (!form.value.name) {
			form.value.error = "Informe o nome";
			return false;
		}
		if (!form.value.email) {
			form.value.error = "Informe o email";
			return false;
		}
		if (!form.value.cpf) {
			form.value.error = "Informe o CPF";
			return false;
		}
	}
	if (form.value.step === 3) {
		if (!form.value.password) {
			form.value.error = "Informe a senha";
			return false;
		}
		if (!form.value.confirmPassword) {
			form.value.error = "Informe a confirmação de senha";
			return false;
		}
		if (form.value.password !== form.value.confirmPassword) {
			form.value.error = "A senha e a confirmação precisam ser iguais";
			return false;
		}
	}
	form.value.error = "";
	return true;
}

function next() {
	if (validate()) form.value.step++;
}

function previous() {
	form.value.step--;
}

async function confirm() {
	if (validate()) {
		try {
			const { cpf, email, isPassenger, name, password } = form.value;
			const result = await accountGateway.signup({
				cpf,
				email,
				isPassenger,
				name,
				password,
			});
			form.value.success = result.accountId;
		} catch (e) {
			console.error(e);
		}
	}
}
</script>

<template>
	<div>
		<div>
			<span class="span-step">{{ form.step }}</span>
		</div>
		<div>
			<span>Progresso </span>
			<span class="span-progress">{{ calculateProgress() }}%</span>
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
		<button class="button-previous" @click="previous()">Anterior</button>
	</div>
	<div v-if="form.step < 3">
		<button class="button-next" @click="next()">Próximo</button>
	</div>
	<div v-if="form.step === 3">
		<button class="button-confirm" @click="confirm()">Confirmar</button>
	</div>
</template>

<style scoped>
</style>
