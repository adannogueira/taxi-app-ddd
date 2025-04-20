import type { Class } from "./class.type";

export class Registry {
	private dependencies: {
		[name: symbol]: { class: Class<unknown> | unknown; singleton: boolean };
	};
	private instances: { [name: symbol]: unknown };
	private static instance: Registry;

	private constructor() {
		this.dependencies = {};
		this.instances = {};
	}

	provide<T = unknown>(
		name: symbol,
		dependency: Class<T> | T,
		singleton = false,
	) {
		this.dependencies[name] = { class: dependency, singleton };
		if (singleton) this.instances[name] = dependency;
	}

	inject<T extends Class<unknown>>(name: symbol) {
		if (!this.dependencies[name])
			throw new Error(`Dependency ${name.valueOf} not registered`);
		const dependency = this.dependencies[name];
		if (dependency.singleton) return this.instances[name];
		const classRef = this.dependencies[name].class as T;
		return new classRef();
	}

	static getInstance() {
		if (!Registry.instance) Registry.instance = new Registry();
		return Registry.instance;
	}
}

export function inject(name: symbol) {
	return <T extends object>(target: T, propertyKey: PropertyKey) => {
		Object.defineProperty(target, propertyKey, {
			value: new Proxy(
				{},
				{
					get(target: unknown, proxyPropertyKey: PropertyKey) {
						const dependency = Registry.getInstance().inject(name);
						return (dependency as Record<PropertyKey, unknown>)[
							proxyPropertyKey
						];
					},
				},
			),
		});
	};
}
