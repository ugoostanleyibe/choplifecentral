import { onStoreClear, store } from "./store.js";

const modules = new Map();
const moduleScopes = new Map();

onStoreClear(() => {
	for (const scope of moduleScopes.values()) {
		for (const cleanup of scope.effects) {
			try {
				cleanup();
			} catch {}
		}

		scope.effects.length = 0;
	}

	moduleScopes.clear();
	modules.clear();
});

/**
 * Context passed to every store action.
 *
 * @typedef {Object} ActionContext
 * @property {Object} state Reactive state proxy.
 * @property {Function} get Read a state value.
 * @property {Function} set Set a state value.
 * @property {Function} update Update a state value.
 * @property {Function} touch Notify subscribers after mutating a value in place.
 * @property {Function} select Create a computed selector.
 */

/**
 * @typedef {Object} StoreModuleDefinition
 * @property {Object} [state] Initial state values.
 * @property {Object<string, (ctx: ActionContext, payload: any) => any>} [actions] Action handlers.
 * @property {Function} [cleanup] Cleanup hook called when the module is destroyed.
 */

/**
 * Create a proxy that maps property access to a module namespace.
 *
 * @param {object} api
 * @param {Set<string>} stateKeys
 * @returns {Object}
 */
function createStateProxy(api, stateKeys) {
	return new Proxy(
		{},
		{
			get(_, key) {
				if (typeof key === "symbol") {
					return undefined;
				}

				return api.get(key);
			},

			set(_, key, value) {
				if (typeof key === "symbol") {
					return true;
				}

				api.set(key, value);

				return true;
			},

			deleteProperty(_, key) {
				if (typeof key === "symbol") {
					return true;
				}

				api.delete(key);

				return true;
			},

			has(_, key) {
				return (
					typeof key === "string" &&
					api.has(key)
				);
			},

			ownKeys() {
				const keys = new Set(stateKeys);

				for (const key of api.keys()) {
					keys.add(key);
				}

				return Array.from(keys).filter((key) =>
					api.has(key),
				);
			},

			getOwnPropertyDescriptor(_, key) {
				if (
					typeof key === "string" &&
					api.has(key)
				) {
					return {
						enumerable: true,
						configurable: true,
						writable: true,
						value: api.get(key),
					};
				}

				return undefined;
			},
		},
	);
}

/**
 * Register a store module.
 *
 * @param {string} name
 * @param {StoreModuleDefinition} def
 * @returns {object}
 */
export function defineStore(name, def = {}) {
	if (modules.has(name)) {
		return modules.get(name);
	}

	const ns = store.createNamespace(name);

	const stateKeys = new Set(
		Object.keys(def.state || {}),
	);

	const selectorScope = {
		effects: [],
	};

	/** @type {Set<import("./persist.js").PersistController>} */
	const persistControllers = new Set();

	const api = {
		...ns,

		set(key, value) {
			stateKeys.add(key);
			ns.set(key, value);
		},

		update(key, fn) {
			stateKeys.add(key);
			ns.update(key, fn);
		},

		delete(key) {
			stateKeys.delete(key);
			ns.delete(key);
		},

		persist(keys, options) {
			const controller = ns.persist.call(
				api,
				keys,
				options,
			);

			persistControllers.add(controller);

			return controller;
		},
	};

	const stateProxy = createStateProxy(
		api,
		stateKeys,
	);

	for (const key in def.state || {}) {
		api.set(
			key,
			def.state[key],
		);
	}

	const moduleApi = {
		...api,

		state: stateProxy,

		select(selector, scope) {
			return ns.select(
				() =>
					selector(
						stateProxy,
						moduleApi,
					),
				scope || selectorScope,
			);
		},

		destroy() {
			if (typeof def.cleanup === "function") {
				try {
					def.cleanup(moduleApi);
				} catch {}
			}

			for (const cleanup of selectorScope.effects) {
				try {
					cleanup();
				} catch {}
			}

			selectorScope.effects.length = 0;

			for (const controller of persistControllers) {
				try {
					controller.stop();
				} catch {}
			}

			persistControllers.clear();

			const keysToRemove = new Set([
				...stateKeys,
				...ns.keys(),
			]);

			for (const key of keysToRemove) {
				api.delete(key);
			}

			stateKeys.clear();

			for (const key in def.actions || {}) {
				store.deleteAction(
					`${name}:${key}`,
				);
			}

			moduleScopes.delete(name);
			modules.delete(name);
		},
	};

	for (const key in def.actions || {}) {
		const actionName = `${name}:${key}`;

		store.defineAction(
			actionName,
			(_globalCtx, payload) => {
				const ctx = {
					state: stateProxy,
					get: api.get,
					set: api.set,
					update: api.update,
					touch: api.touch,
					select: moduleApi.select,
				};

				return def.actions[key](
					ctx,
					payload,
				);
			},
		);
	}

	moduleScopes.set(
		name,
		selectorScope,
	);

	modules.set(
		name,
		moduleApi,
	);

	return moduleApi;
}

/**
 * Retrieve a registered store module by name.
 *
 * @param {string} name
 * @returns {object|undefined}
 */
export function useStore(name) {
	return modules.get(name);
}

/**
 * Destroy a store module and clean up its resources.
 *
 * @param {string} name
 */
export function destroyStore(name) {
	modules.get(name)?.destroy();
}
