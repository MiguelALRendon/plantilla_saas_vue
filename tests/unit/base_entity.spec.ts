import { describe, it, expect } from 'vitest';
import { BaseEntity } from '@/entities/base_entity';
import {
    DefaultProperty,
    Disabled,
    Module,
    PrimaryProperty,
    PropertyIndex,
    PropertyName,
    Required,
    UniquePropertyKey,
} from '@/decorations';

@Module({ name: 'Test', apiEndpoint: '/tests', apiMethods: ['GET', 'POST', 'PUT', 'DELETE'] })
@PrimaryProperty('id')
@UniquePropertyKey('id')
@DefaultProperty('nombre')
class TestEntity extends BaseEntity {
    // Sin inicializador (`?`): los inicializadores de campo de subclase corren
    // tras super() y pisarían los datos del constructor (ver capitulo.ts).
    @PropertyIndex(2)
    @PropertyName('Nombre', String)
    @Required(true)
    nombre?: string;

    @PropertyIndex(1)
    @PropertyName('Edad', Number)
    edad?: number;

    @PropertyName('Secreto', String)
    @Disabled(true)
    secreto?: string;

    // Sin @PropertyName → no se serializa al API.
    id?: string;
}

describe('BaseEntity — metadatos y orden', () => {
    it('getKeys respeta @PropertyIndex y excluye props sin @PropertyName', () => {
        const e = new TestEntity({ nombre: 'a', edad: 5 });
        // edad(1) antes que nombre(2); secreto sin índice va al final; id no aparece.
        expect(e.getKeys()).toEqual(['edad', 'nombre', 'secreto']);
    });

    it('isRequired refleja @Required', () => {
        const e = new TestEntity({ nombre: 'a', edad: 5 });
        expect(e.isRequired('nombre')).toBe(true);
        expect(e.isRequired('edad')).toBe(false);
    });

    it('isDisabled refleja @Disabled', () => {
        const e = new TestEntity({ nombre: 'a', edad: 5 });
        expect(e.isDisabled('secreto')).toBe(true);
        expect(e.isDisabled('nombre')).toBe(false);
    });
});

describe('BaseEntity — persistencia', () => {
    it('buildRequestPayload excluye campos deshabilitados e ignora props sin @PropertyName', () => {
        const e = new TestEntity({ nombre: 'a', edad: 5 });
        e.id = 'abc';
        const payload = e.buildRequestPayload();
        expect(payload).toEqual({ nombre: 'a', edad: 5 });
        expect(payload).not.toHaveProperty('secreto');
        expect(payload).not.toHaveProperty('id');
    });

    it('isNew según la primary property', () => {
        const e = new TestEntity({ nombre: 'a', edad: 5 });
        expect(e.isNew()).toBe(true);
        e.id = '123';
        expect(e.isNew()).toBe(false);
    });
});

describe('BaseEntity — dirty state', () => {
    it('detecta cambios y resetChanges revierte al estado original', () => {
        const e = new TestEntity({ nombre: 'a', edad: 5 });
        expect(e.getDirtyState()).toBe(false);

        e.nombre = 'b';
        expect(e.getDirtyState()).toBe(true);

        e.resetChanges();
        expect(e.nombre).toBe('a');
        expect(e.getDirtyState()).toBe(false);
    });
});
