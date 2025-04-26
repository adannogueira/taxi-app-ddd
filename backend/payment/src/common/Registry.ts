export class Registry {
	private dependencies: { [name: symbol]: { class: any; singleton: boolean } };
	private instances: { [name: symbol]: any };
	private static instance: Registry;

	private constructor() {
		this.dependencies = {};
		this.instances = {};
	}

	provide(name: symbol, dependency: any, singleton = false) {
		this.dependencies[name] = { class: dependency, singleton };
		if (singleton) this.instances[name] = dependency;
	}

	inject(name: symbol) {
		if (!this.dependencies[name])
			throw new Error(`Dependency ${name.valueOf} not registered`);
		const dependency = this.dependencies[name];
		if (dependency.singleton) return this.instances[name];
		return new this.dependencies[name].class();
	}

	static getInstance() {
		if (!Registry.instance) Registry.instance = new Registry();
		return Registry.instance;
	}
}

export function inject(name: symbol) {
	return (target: any, propertyKey: string) => {
		target[propertyKey] = new Proxy(
			{},
			{
				get(target: any, propertyKey: string) {
					const dependency = Registry.getInstance().inject(name);
					return dependency[propertyKey];
				},
			},
		);
	};
}
