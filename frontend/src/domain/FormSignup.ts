import { Observable } from "./Observable";

export class FormSignup extends Observable {
	name = "";
	email = "";
	cpf = "";
	password = "";
	confirmPassword = "";
	isPassenger = false;
	step = 1;
	error = "";
	success = "";

	calculateProgress() {
		let progress = 0;
		if (this.isPassenger) progress += 25;
		if (this.name) progress += 20;
		if (this.email) progress += 20;
		if (this.cpf) progress += 20;
		if (this.password && this?.password === this?.confirmPassword)
			progress += 15;
		return progress;
	}

	validate() {
		if (this.step === 1 && !this.isPassenger) {
			this.error = "Selecione o tipo de conta";
			return false;
		}
		if (this.step === 2) {
			if (!this.name) {
				this.error = "Informe o nome";
				return false;
			}
			if (!this.email) {
				this.error = "Informe o email";
				return false;
			}
			if (!this.cpf) {
				this.error = "Informe o CPF";
				return false;
			}
		}
		if (this.step === 3) {
			if (!this.password) {
				this.error = "Informe a senha";
				return false;
			}
			if (!this.confirmPassword) {
				this.error = "Informe a confirmação de senha";
				return false;
			}
			if (this.password !== this.confirmPassword) {
				this.error = "A senha e a confirmação precisam ser iguais";
				return false;
			}
		}
		this.error = "";
		return true;
	}

	next() {
		if (this.validate()) this.step++;
	}

	previous() {
		this.step--;
	}

	async confirm() {
		if (this.validate()) {
			const data = {
				cpf: this.cpf,
				email: this.email,
				isPassenger: this.isPassenger,
				name: this.name,
				password: this.password,
			};
			this.notifyAll({ event: "confirmed", data });
		}
	}
}
