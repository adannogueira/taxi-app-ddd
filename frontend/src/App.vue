<script setup lang="ts">
import { ref, watch } from "vue";
import axios from "axios";

const form = ref({
	name: "",
	email: "",
	cpf: "",
	password: "",
	isPassenger: false,
	isDriver: false,
	carPlate: "",
});
const accountId = ref("");
const status = ref("");
const message = ref("");
const type = ref("");

watch(type, (selected) => {
	form.value.isPassenger = selected === "passenger";
	form.value.isDriver = selected === "driver";
});

function fill() {
	form.value.name = "Johnny Depp";
	form.value.email = "johnny@depp.com";
	form.value.cpf = "00000000191";
	form.value.password = "admin123";
	form.value.isPassenger = true;
	form.value.isDriver = false;
	type.value = "passenger";
}

async function signup() {
	try {
		const response = await axios.post(
			"http://localhost:3000/signup",
			{
				...form.value,
			},
			{ headers: { "Content-Type": "application/json" } },
		);
		console.log(response.data);
		const output = response.data;
		accountId.value = output.accountId;
		status.value = "success";
	} catch (err) {
		message.value = err.response.data;
		status.value = "error";
	}
}
</script>

<template>
  <div>
    <input class="input-name" type="text" placeholder="Name" v-model="form.name"/>
  </div>
  <div>
    <input class="input-email" type="text" placeholder="Email" v-model="form.email"/>
  </div>
  <div>
    <input class="input-cpf" type="text" placeholder="CPF" v-model="form.cpf"/>
  </div>
  <div>
    <input type="text" class="input-password" placeholder="Password" v-model="form.password"/>
  </div>
  <div>
    <input type="radio" class="input-passenger" value="passenger" v-model="type" />
    <label for="passenger">Passenger</label>

    <input type="radio" class="input-passenger" value="driver" v-model="type" />
    <label for="driver">Driver</label>
  </div>
  <br>
  {{ form }}
  <br>
  {{ accountId }}
  <br>
  <span class="span-status">{{ status }}</span>
  <br>
  <span class="span-message">{{ message }}</span>
  <br>
  <div>
    <button class="button-signup" @click="signup">Signup</button>
    <button @click="fill()">Fill</button>
  </div>
</template>

<style scoped>
</style>
