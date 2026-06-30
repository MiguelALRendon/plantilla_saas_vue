import { describe, it, expect } from 'vitest';
import { BaseEntity } from '@/entities/base_entity';
import {
    AsyncValidation,
    DefaultProperty,
    Module,
    PrimaryProperty,
    PropertyName,
    Required,
    UniquePropertyKey,
    Validation,
} from '@/decorations';

// Verifies Fase 5 of docs/quality-audit.md: stacking multiple @Required/@Validation/
// @AsyncValidation on one property used to silently overwrite — only the last decorator
// applied survived. Metadata is now stored as an array per property so every rule applies.

@Module({ name: 'StackingTest', apiEndpoint: '/stacking-tests', apiMethods: ['GET', 'POST'] })
@PrimaryProperty('id')
@UniquePropertyKey('id')
@DefaultProperty('email')
class StackingTestEntity extends BaseEntity {
    @PropertyName('Email', String)
    @Required(true, 'always required')
    @Required((e: StackingTestEntity) => e.notify === true, 'required when notify is on')
    email?: string;

    @PropertyName('Notify', Boolean)
    notify?: boolean;

    @PropertyName('Precio', Number)
    @Validation((e: StackingTestEntity) => (e.precio ?? 0) > 0, 'must be > 0')
    @Validation((e: StackingTestEntity) => (e.precio ?? 0) < 100, 'must be < 100')
    precio?: number;

    @PropertyName('Codigo', String)
    @AsyncValidation(async (e: StackingTestEntity) => (e.codigo?.length ?? 0) > 0, 'codigo required')
    @AsyncValidation(async (e: StackingTestEntity) => e.codigo !== 'taken', 'codigo already taken')
    codigo?: string;

    id?: string;
}

describe('Validation decorators — stacking (array metadata)', () => {
    it('@Required: OR semantics — required if ANY stacked rule triggers, message from first triggered', () => {
        const e = new StackingTestEntity({ email: 'a@b.com', notify: false });
        // First @Required(true, ...) always triggers regardless of notify.
        expect(e.isRequired('email')).toBe(true);
        expect(e.requiredMessage('email')).toBe('always required');
    });

    it('@Validation: AND semantics — invalid if ANY stacked rule fails', () => {
        const e = new StackingTestEntity({ email: 'a@b.com', precio: 0 });
        expect(e.isValidation('precio')).toBe(false);
        expect(e.validationMessage('precio')).toBe('must be > 0');

        e.precio = 150;
        expect(e.isValidation('precio')).toBe(false);
        expect(e.validationMessage('precio')).toBe('must be < 100');

        e.precio = 50;
        expect(e.isValidation('precio')).toBe(true);
    });

    it('@AsyncValidation: AND semantics — invalid if ANY stacked rule fails, message from failing rule', async () => {
        const e = new StackingTestEntity({ email: 'a@b.com', codigo: '' });
        expect(await e.isAsyncValidation('codigo')).toBe(false);
        expect(e.asyncValidationMessage('codigo')).toBe('codigo required');

        e.codigo = 'taken';
        expect(await e.isAsyncValidation('codigo')).toBe(false);
        expect(e.asyncValidationMessage('codigo')).toBe('codigo already taken');

        e.codigo = 'free';
        expect(await e.isAsyncValidation('codigo')).toBe(true);
    });
});
