import { describe, it, expect } from 'vitest';
import { BaseEntity } from '@/entities/base_entity';
import { DefaultProperty, Module, PrimaryProperty, PropertyName, UniquePropertyKey } from '@/decorations';
import { Validators } from '@/validators/common_validators';

@Module({ name: 'VTest', persistent: false })
@PrimaryProperty('id')
@UniquePropertyKey('id')
@DefaultProperty('email')
class VTest extends BaseEntity {
    // Sin inicializador (`?`) para no pisar los datos del constructor.
    @PropertyName('Email', String)
    @Validators.email()
    email?: string;

    @PropertyName('Edad', Number)
    @Validators.range(1, 10)
    edad?: number;

    id?: string;
}

describe('Validators (vía isValidation)', () => {
    it('email valida formato y deja pasar vacío', () => {
        expect(new VTest({ email: 'bad' }).isValidation('email')).toBe(false);
        expect(new VTest({ email: 'a@b.com' }).isValidation('email')).toBe(true);
        expect(new VTest({ email: '' }).isValidation('email')).toBe(true);
    });

    it('range valida límites numéricos', () => {
        expect(new VTest({ edad: 5 }).isValidation('edad')).toBe(true);
        expect(new VTest({ edad: 20 }).isValidation('edad')).toBe(false);
        expect(new VTest({ edad: 0 }).isValidation('edad')).toBe(false);
    });
});
