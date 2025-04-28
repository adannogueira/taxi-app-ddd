<script setup lang="ts">
import { ref } from "vue";

const form = ref({
	name: "",
	email: "",
	cpf: "",
	password: "",
	confirmPassword: "",
	isPassenger: false,
	step: 1,
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

function next() {
	form.value.step++;
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
	</div>
	<div>
		<span>Passageiro </span>
		<input type="checkbox" class="input-is-passenger" v-model="form.isPassenger"/>
	</div>
	<div><button class="button-next" @click="next()">Próximo</button></div>
	<div>
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
	<div>
		<div>
			<span>Senha </span>
			<input type="password" class="input-password" v-model="form.password">
		</div>
		<div>
			<span>Confirmação de senha </span>
			<input type="password" class="input-confirm-password" v-model="form.confirmPassword">
		</div>
	</div>
</template>

<style scoped>
</style>
