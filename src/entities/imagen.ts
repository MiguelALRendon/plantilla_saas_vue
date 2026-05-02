/**
 * ⚠️  CLASE DE PRUEBA — ELIMINAR ANTES DE PRODUCCIÓN ⚠️
 *
 * Esta entidad fue creada exclusivamente para testing de integración y de
 * la capa de framework (BaseEntity, decoradores, save/delete/getElement).
 *
 * Mapea al endpoint real /api/continental/imagen de la API Gateway.
 * El modelo pertenece al microservicio continental_media (puerto 8102).
 *
 * Endpoints disponibles:
 *   GET    /api/continental/imagen/         — lista de imágenes
 *   GET    /api/continental/imagen/<id>     — detalle
 *   POST   /api/continental/imagen/         — crear (JSON)
 *   PUT    /api/continental/imagen/<id>     — actualizar (JSON)
 *   DELETE /api/continental/imagen/<id>     — eliminar
 *   POST   /api/continental/imagen/upload   — subir archivo (multipart/form-data)
 *                                             campos: file (File), nombre (String)
 *                                             max 5 MB, tipos: jpg/jpeg/png
 *
 * Campos del modelo real (continental_media/app/models/imagen.py):
 *   nombre (String 255, required)
 *   url_archivo (String 500, required — lo asigna el servidor tras la subida)
 *   + id (UUID String), url_busqueda (String unique), created_at, updated_at, estatus
 */

import {
    DefaultProperty,
    HideInDetailView,
    Module,
    PrimaryProperty,
    PropertyIndex,
    PropertyName,
    Required,
    UniquePropertyKey,
} from '@/decorations';
import ICONS from '@/constants/icons';

import { BaseEntity } from './base_entity';

@Module({
    name: 'custom.imagen.title',
    icon: ICONS.AVATAR,
    apiEndpoint: '/api/continental/imagen',
    apiMethods: ['GET', 'POST', 'PUT', 'DELETE'],
})
@PrimaryProperty('id')
@UniquePropertyKey('id')
@DefaultProperty('nombre')
export class Imagen extends BaseEntity {

    @PropertyIndex(1)
    @PropertyName('ID', String)
    @HideInDetailView()
    id?: string;

    @PropertyIndex(2)
    @PropertyName('custom.imagen.nombre', String)
    @Required(true, 'custom.imagen.errors.nombre_required')
    nombre?: string;

    @PropertyIndex(3)
    @PropertyName('custom.imagen.url_archivo', String)
    @Required(true, 'custom.imagen.errors.url_required')
    url_archivo?: string;

    // ── Campos de respuesta de la API (sin @PropertyName) ────────────────

    url_busqueda?: string;
    created_at?: string;
    updated_at?: string;
    estatus?: number;
}
