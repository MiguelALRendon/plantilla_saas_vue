import { describe, it, expect, vi, afterEach } from 'vitest';
import { BaseEntity } from '@/entities/base_entity';
import Application from '@/models/application';
import {
    DefaultProperty,
    Disabled,
    Module,
    PrimaryProperty,
    PropertyName,
    UniquePropertyKey,
} from '@/decorations';

@Module({ name: 'Crud', icon: 'test-icon', apiEndpoint: '/cruds', apiMethods: ['GET', 'POST', 'PUT', 'DELETE'] })
@PrimaryProperty('id')
@UniquePropertyKey('id')
@DefaultProperty('nombre')
class CrudEntity extends BaseEntity {
    @PropertyName('Nombre', String)
    nombre?: string;

    @PropertyName('Secreto', String)
    @Disabled(true)
    secreto?: string;

    id?: string;
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe('BaseEntity CRUD (axios mockeado)', () => {
    it('save() hace POST con payload (sin campos deshabilitados) y mapea la respuesta', async () => {
        const entity = new CrudEntity({ nombre: 'a', secreto: 'x' });
        const post = vi
            .spyOn(Application.axiosInstance, 'post')
            .mockResolvedValue({ data: { id: 'new-1', nombre: 'a' } });

        await entity.save();

        expect(post).toHaveBeenCalledWith('/cruds', { nombre: 'a' });
        expect(entity.id).toBe('new-1');
    });

    it('update() valida y hace PUT a /endpoint/:id', async () => {
        const entity = new CrudEntity({ nombre: 'a' });
        entity.id = 'abc';
        const put = vi
            .spyOn(Application.axiosInstance, 'put')
            .mockResolvedValue({ data: { id: 'abc', nombre: 'a' } });

        await entity.update();

        expect(put).toHaveBeenCalledWith('/cruds/abc', { nombre: 'a' });
    });

    it('delete() hace DELETE a /endpoint/:id', async () => {
        const entity = new CrudEntity({ nombre: 'a' });
        entity.id = 'abc';
        const del = vi.spyOn(Application.axiosInstance, 'delete').mockResolvedValue({ data: {} });

        await entity.delete();

        expect(del).toHaveBeenCalledWith('/cruds/abc');
    });

    it('getElement() hace GET a /endpoint/:id y construye la instancia', async () => {
        const get = vi
            .spyOn(Application.axiosInstance, 'get')
            .mockResolvedValue({ data: { id: '1', nombre: 'a' } });

        const loaded = await CrudEntity.getElement('1');

        expect(get).toHaveBeenCalledWith('/cruds/1', expect.anything());
        expect(loaded.id).toBe('1');
        expect(loaded.nombre).toBe('a');
    });

    it('getElementList() hace GET y construye instancias (array plano)', async () => {
        const get = vi
            .spyOn(Application.axiosInstance, 'get')
            .mockResolvedValue({ data: [{ id: '1', nombre: 'a' }, { id: '2', nombre: 'b' }] });

        const list = await CrudEntity.getElementList();

        expect(get).toHaveBeenCalledWith('/cruds', { params: { filter: '' } });
        expect(list).toHaveLength(2);
        expect(list[0].id).toBe('1');
        expect(list[1].nombre).toBe('b');
    });

    it('getElementListPaginated() interpreta el envelope { data, total }', async () => {
        const get = vi
            .spyOn(Application.axiosInstance, 'get')
            .mockResolvedValue({ data: { data: [{ id: '1', nombre: 'a' }], total: 7, page: 1, limit: 20 } });

        const result = await CrudEntity.getElementListPaginated({ page: 1, limit: 20 });

        expect(result.total).toBe(7);
        expect(result.data).toHaveLength(1);
        expect(result.data[0].id).toBe('1');
    });
});
