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

    it('compara Maps por entradas', () => {
        expect(deepEqual(new Map([['a', 1]]), new Map([['a', 1]]))).toBe(true);
        expect(deepEqual(new Map([['a', 1]]), new Map([['a', 2]]))).toBe(false);
        expect(deepEqual(new Map([['a', 1]]), new Map([['a', 1], ['b', 2]]))).toBe(false);
    });

    it('compara Sets sin importar el orden', () => {
        expect(deepEqual(new Set([1, 2, 3]), new Set([3, 2, 1]))).toBe(true);
        expect(deepEqual(new Set([1, 2]), new Set([1, 3]))).toBe(false);
    });

    it('no entra en loop infinito con referencias circulares', () => {
        const a: Record<string, unknown> = { name: 'a' };
        a.self = a;
        const b: Record<string, unknown> = { name: 'a' };
        b.self = b;
        expect(deepEqual(a, b)).toBe(true);

        const c: Record<string, unknown> = { name: 'c' };
        c.self = c;
        expect(deepEqual(a, c)).toBe(false);
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

    it('clona Maps y Sets sin compartir referencias', () => {
        const map = new Map([['a', { x: 1 }]]);
        const clonedMap = deepClone(map);
        expect(clonedMap).not.toBe(map);
        expect(clonedMap.get('a')).toEqual({ x: 1 });
        expect(clonedMap.get('a')).not.toBe(map.get('a'));

        const set = new Set([{ x: 1 }]);
        const clonedSet = deepClone(set);
        expect(clonedSet).not.toBe(set);
        expect([...clonedSet]).toEqual([...set]);
    });

    it('clona referencias circulares sin desbordar la pila', () => {
        const src: Record<string, unknown> = { name: 'a' };
        src.self = src;
        const copy = deepClone(src);
        expect(copy.name).toBe('a');
        expect(copy.self).toBe(copy);
        expect(copy).not.toBe(src);
    });
});
