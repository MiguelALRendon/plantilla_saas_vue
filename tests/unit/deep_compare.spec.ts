import { describe, it, expect } from 'vitest';
import { deepEqual, deepClone } from '@/utils/deep_compare';

describe('deepEqual', () => {
    it('compara primitivos', () => {
        expect(deepEqual(1, 1)).toBe(true);
        expect(deepEqual(1, 2)).toBe(false);
        expect(deepEqual('a', 'a')).toBe(true);
        expect(deepEqual(true, false)).toBe(false);
    });

    it('maneja null/undefined', () => {
        expect(deepEqual(null, null)).toBe(true);
        expect(deepEqual(null, undefined)).toBe(false);
        expect(deepEqual(undefined, undefined)).toBe(true);
    });

    it('compara objetos anidados', () => {
        expect(deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toBe(true);
        expect(deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 3 } })).toBe(false);
    });

    it('compara arrays', () => {
        expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
        expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it('compara fechas por valor', () => {
        expect(deepEqual(new Date(0), new Date(0))).toBe(true);
        expect(deepEqual(new Date(0), new Date(1))).toBe(false);
    });

    it('detecta distinto número de claves', () => {
        expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });
});

describe('deepClone', () => {
    it('clona en profundidad sin compartir referencias', () => {
        const src = { a: 1, b: { c: [1, 2] } };
        const copy = deepClone(src);
        expect(copy).toEqual(src);
        copy.b.c.push(3);
        expect(src.b.c).toEqual([1, 2]);
    });

    it('clona fechas', () => {
        const d = new Date(123);
        const c = deepClone(d);
        expect(c.getTime()).toBe(123);
        expect(c).not.toBe(d);
    });

    it('pasa primitivos/null/undefined tal cual', () => {
        expect(deepClone(null)).toBeNull();
        expect(deepClone(undefined)).toBeUndefined();
        expect(deepClone(5)).toBe(5);
    });
});
