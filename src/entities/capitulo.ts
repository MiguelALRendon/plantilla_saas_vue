/**
 * ⚠️  CLASE DE PRUEBA — ELIMINAR ANTES DE PRODUCCIÓN ⚠️
 *
 * Esta entidad fue creada exclusivamente para testing de integración y de
 * la capa de framework (BaseEntity, decoradores, save/delete/getElement).
 *
 * Mapea al endpoint real /api/continental/capitulo de la API Gateway.
 * El equipo de backend puede recrear o extender este objeto en cualquier
 * momento usando el microservicio continental_content (puerto 8101).
 *
 * Para pruebas de integración se necesita:
 *   - Gateway corriendo en http://localhost:8200
 *   - Una obra válida en la DB (tabla obras, campo id)
 *   - Credenciales de usuario válidas
 *
 * Campos del modelo real (continental_content/app/models/capitulo.py):
 *   titulo (String 100, required)
 *   numero_capitulo (Integer, required)
 *   obra_id (FK a obras, required)
 *   url_busqueda (String 255, unique, required)
 *   descripcion_larga, descripcion_corta, url_portada,
 *   texto_capitulo, comentario_creador
 *   + campos SEO (SeoMixin)
 *   + id (UUID String), created_at, updated_at, estatus
 */

import {
    DefaultProperty,
    HideInDetailView,
    Module,
    PrimaryProperty,
    PropertyIndex,
    PropertyName,
    Required,
    StringTypeDef,
    UniquePropertyKey,
    Disabled,
    HideInListView,
} from '@/decorations';
import { StringType } from '@/enums/string_type';
import ICONS from '@/constants/icons';

import { BaseEntity } from './base_entity';

@Module({
    name: 'custom.capitulo.title',
    icon: ICONS.AVATAR,
    apiEndpoint: '/capitulo/',
    apiMethods: ['GET', 'POST', 'PUT', 'DELETE'],
})
@PrimaryProperty('id')
@UniquePropertyKey('id')
@DefaultProperty('titulo')
export class Capitulo extends BaseEntity {

    // ── Campos de base (sin @PropertyName = no se serializan en payload) ──

    /**
     * UUID generado por el servidor. No se incluye en el payload de POST.
     * @HideInDetailView para que no aparezca en formularios de edición.
     */
    @PropertyIndex(1)
    @PropertyName('ID', String)
    @HideInDetailView()
    @HideInListView()
    id?: string;

    // ── Campos principales (con @PropertyName = se serializan) ───────────

    @PropertyIndex(2)
    @PropertyName('custom.capitulo.titulo', String)
    @Required(true, 'custom.capitulo.errors.titulo_required')
    titulo?: string;

    @PropertyIndex(3)
    @PropertyName('custom.capitulo.numero_capitulo', Number)
    @Required(true, 'custom.capitulo.errors.numero_required')
    numero_capitulo?: number;

    @PropertyIndex(4)
    @PropertyName('custom.capitulo.obra_id', String)
    @Required(true, 'custom.capitulo.errors.obra_required')
    @HideInListView()
    obra_id?: string;

    @PropertyIndex(5)
    @PropertyName('custom.capitulo.url_busqueda', String)
    @Required(true, 'custom.capitulo.errors.url_required')
    url_busqueda?: string;

    @PropertyIndex(6)
    @PropertyName('custom.capitulo.descripcion_larga', String)
    @StringTypeDef(StringType.TEXTAREA)
    @HideInListView()
    descripcion_larga?: string;

    @PropertyIndex(7)
    @PropertyName('custom.capitulo.descripcion_corta', String)
    descripcion_corta?: string;

    @PropertyIndex(8)
    @PropertyName('custom.capitulo.url_portada', String)
    url_portada?: string;

    @PropertyIndex(9)
    @PropertyName('custom.capitulo.texto_capitulo', String)
    @StringTypeDef(StringType.TEXTAREA)
    @HideInListView()
    texto_capitulo?: string;

    @PropertyIndex(10)
    @PropertyName('custom.capitulo.comentario_creador', String)
    @StringTypeDef(StringType.TEXTAREA)
    @Disabled((entity: Capitulo) => !entity.id)
    comentario_creador?: string;

    // ── Campos de respuesta de la API (sin @PropertyName) ────────────────
    // Relaciones expandidas que la API devuelve pero no se postean de vuelta.

    created_at?: string;
    updated_at?: string;
    estatus?: number;
    subarco_id?: string;
    subarco?: Record<string, unknown>;
    obra?: Record<string, unknown>;

    // ── Campos SEO (sin @PropertyName — gestionados por el servidor) ──────

    titulo_seo?: string;
    descripcion_seo?: string;
    slug?: string;
    keywords?: string;
}
