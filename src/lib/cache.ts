interface _CacheEntry {
	value: any;
	ttl: number | null;
}

interface CacheConstructorOptions {
	defaultTtlSeconds?: number;
	cleanupIntervalSeconds?: number;
}

class Cache_ {
	#_cache: Map<string, _CacheEntry>;
	#defaultTtl: number | null;
	#cleanupInterval: NodeJS.Timeout;

	constructor(opts: CacheConstructorOptions = {}) {
		this.#_cache = new Map();
		this.#defaultTtl = opts.defaultTtlSeconds ?? null;
		this.#cleanupInterval = this.#startCleanupInterval(opts.cleanupIntervalSeconds ?? 60 * 10);
	}

	#startCleanupInterval(interval: number) {
		return setInterval(() => {
			console.info('Cache cleanup starting');
			const now = Date.now();
			for (const [key, entry] of this.#_cache.entries()) {
				if (entry.ttl !== null && entry.ttl < now) {
					this.#_cache.delete(key);
				}
			}
		}, interval * 1000);
	}

	get(key: string): any | null {
		const entry = this.#_cache.get(key);
		if (!entry) {
			return null;
		}

		if (entry.ttl !== null) {
			if (Date.now() > entry.ttl) {
				this.#_cache.delete(key);
				return null;
			}
		}

		return entry.value;
	}

	set(key: string, value: any, ttl: number | null = this.#defaultTtl) {
		if (ttl !== null) {
			if (ttl <= 0) {
				throw new Error('ttl must be positive or null');
			}
		}

		const entryTtl = ttl ? Date.now() + ttl * 1000 : null;
		this.#_cache.set(key, { value: value, ttl: entryTtl });
	}
}

export const cache = new Cache_({ defaultTtlSeconds: 60, cleanupIntervalSeconds: 60 * 10 });
