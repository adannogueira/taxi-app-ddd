export class Cpf {
	readonly value;

	constructor(cpf: string) {
		if (!this.validateCpf(cpf)) throw new Error("Invalid Cpf");
		this.value = this.clean(cpf);
	}

	private validateCpf(cpf: string) {
		if (!cpf) return false;
		const cleanCpf = this.clean(cpf);
		if (cleanCpf.length !== 11) return false;
		if (this.allDigitsTheSame(cleanCpf)) return false;
		const dg1 = this.calculateDigit(cleanCpf, 10);
		const dg2 = this.calculateDigit(cleanCpf, 11);
		const actualDigit = this.extractDigit(cleanCpf);
		return actualDigit === `${dg1}${dg2}`;
	}

	private clean(cpf: string) {
		return cpf.replace(/\D/g, "");
	}

	private allDigitsTheSame(cpf: string) {
		const [firstDigit] = cpf;
		return [...cpf].every((c) => c === firstDigit);
	}

	private calculateDigit(cpf: string, factor: number) {
		let total = 0;
		let reductionFactor = factor;
		for (const digit of cpf) {
			if (reductionFactor > 1)
				total += Number.parseInt(digit) * reductionFactor--;
		}
		const remainder = total % 11;
		return remainder < 2 ? 0 : 11 - remainder;
	}

	private extractDigit(cpf: string) {
		return cpf.slice(9);
	}

	static create(cpf: string) {
		return new Cpf(cpf);
	}
}
