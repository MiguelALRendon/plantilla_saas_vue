/**
 * Performs deep equality comparison for primitive values, arrays, dates and objects.
 * @param obj1 First value to compare.
 * @param obj2 Second value to compare.
 * @returns True when both values are deeply equal.
 */
export function deepEqual(obj1: unknown, obj2: unknown): boolean {
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

    if (obj1 instanceof Date && obj2 instanceof Date) {
        return obj1.getTime() === obj2.getTime();
    }

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) {
            return false;
        }

        for (let index = 0; index < obj1.length; index++) {
            if (!deepEqual(obj1[index], obj2[index])) {
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

        if (!deepEqual(leftObject[key], rightObject[key])) {
            return false;
        }
    }

    return true;
}

/**
 * Creates a deep clone for primitive values, arrays, dates and plain objects.
 * @param value Value to clone.
 * @returns Cloned value.
 */
export function deepClone<T>(value: T): T {
    if (value === null || value === undefined) {
        return value;
    }

    if (value instanceof Date) {
        return new Date(value.getTime()) as T;
    }

    if (Array.isArray(value)) {
        return value.map((item) => deepClone(item)) as T;
    }

    if (typeof value === 'object') {
        const result: Record<string, unknown> = {};
        const entries = Object.entries(value as Record<string, unknown>);

        for (const [key, currentValue] of entries) {
            result[key] = deepClone(currentValue);
        }

        return result as T;
    }

    return value;
}
