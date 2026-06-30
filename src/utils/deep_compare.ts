/**
 * Performs deep equality comparison for primitives, arrays, Dates, Maps, Sets and
 * plain objects.
 * @param obj1 First value to compare.
 * @param obj2 Second value to compare.
 * @param seen Internal: tracks already-compared reference pairs so circular structures
 *   resolve as equal instead of recursing infinitely (basic cycle detection — not full
 *   graph isomorphism). Callers should never pass this explicitly.
 * @returns True when both values are deeply equal.
 */
export function deepEqual(obj1: unknown, obj2: unknown, seen: WeakMap<object, object> = new WeakMap()): boolean {
    if (obj1 === obj2) {
        return true;
    }

    if (obj1 == null || obj2 == null) {
        return obj1 === obj2;
    }

    if (typeof obj1 !== typeof obj2) {
        return false;
    }

    if (typeof obj1 !== 'object') {
        return obj1 === obj2;
    }

    if (seen.get(obj1 as object) === (obj2 as object)) {
        return true;
    }
    seen.set(obj1 as object, obj2 as object);

    if (obj1 instanceof Date && obj2 instanceof Date) {
        return obj1.getTime() === obj2.getTime();
    }

    if (obj1 instanceof Map && obj2 instanceof Map) {
        if (obj1.size !== obj2.size) {
            return false;
        }
        for (const [key, value] of obj1) {
            if (!obj2.has(key) || !deepEqual(value, obj2.get(key), seen)) {
                return false;
            }
        }
        return true;
    }

    if (obj1 instanceof Set && obj2 instanceof Set) {
        if (obj1.size !== obj2.size) {
            return false;
        }
        // Sets are unordered — match each item in obj1 against any remaining
        // (not-yet-matched) item in obj2 rather than comparing by iteration order.
        const remaining = Array.from(obj2);
        for (const item of obj1) {
            const matchIndex = remaining.findIndex((candidate) => deepEqual(item, candidate, seen));
            if (matchIndex === -1) {
                return false;
            }
            remaining.splice(matchIndex, 1);
        }
        return true;
    }

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) {
            return false;
        }

        for (let index = 0; index < obj1.length; index++) {
            if (!deepEqual(obj1[index], obj2[index], seen)) {
                return false;
            }
        }

        return true;
    }

    if (Array.isArray(obj1) !== Array.isArray(obj2)) {
        return false;
    }

    const leftObject = obj1 as Record<string, unknown>;
    const rightObject = obj2 as Record<string, unknown>;

    const keys1 = Object.keys(leftObject);
    const keys2 = Object.keys(rightObject);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        if (!keys2.includes(key)) {
            return false;
        }

        if (!deepEqual(leftObject[key], rightObject[key], seen)) {
            return false;
        }
    }

    return true;
}

/**
 * Creates a deep clone for primitives, arrays, Dates, Maps, Sets and plain objects.
 * @param value Value to clone.
 * @param seen Internal: maps already-cloned source references to their clone so
 *   circular structures resolve to the same clone instance instead of recursing
 *   infinitely. Callers should never pass this explicitly.
 * @returns Cloned value.
 */
export function deepClone<T>(value: T, seen: WeakMap<object, unknown> = new WeakMap()): T {
    if (value === null || value === undefined || typeof value !== 'object') {
        return value;
    }

    const cached = seen.get(value as object);
    if (cached !== undefined) {
        return cached as T;
    }

    if (value instanceof Date) {
        return new Date(value.getTime()) as T;
    }

    if (value instanceof Map) {
        const result = new Map<unknown, unknown>();
        seen.set(value, result);
        for (const [key, mapValue] of value) {
            result.set(deepClone(key, seen), deepClone(mapValue, seen));
        }
        return result as T;
    }

    if (value instanceof Set) {
        const result = new Set<unknown>();
        seen.set(value, result);
        for (const item of value) {
            result.add(deepClone(item, seen));
        }
        return result as T;
    }

    if (Array.isArray(value)) {
        const result: unknown[] = [];
        seen.set(value, result);
        for (const item of value) {
            result.push(deepClone(item, seen));
        }
        return result as T;
    }

    const result: Record<string, unknown> = {};
    seen.set(value, result);
    const entries = Object.entries(value as Record<string, unknown>);

    for (const [key, currentValue] of entries) {
        result[key] = deepClone(currentValue, seen);
    }

    return result as T;
}
