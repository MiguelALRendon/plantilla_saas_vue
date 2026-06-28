import {
    DefaultProperty,
    HelpText,
    HideInListView,
    MaxSizeFiles,
    MaxTagSize,
    MaxTags,
    Module,
    PrimaryProperty,
    PropertyIndex,
    PropertyName,
    Required,
    StringTypeDef,
    SupportedFiles,
    UniquePropertyKey,
    ViewGroup,
} from '@/decorations';
import { StringType } from '@/enums/string_type';
import ICONS from '@/constants/icons';

import { BaseEntity } from './base_entity';

// #region ENUMS

const CATEGORIA_IMAGEN: Record<string, string> = {
    fotografia: 'Fotografía',
    ilustracion: 'Ilustración',
    diagrama: 'Diagrama',
    captura: 'Captura de pantalla',
    logotipo: 'Logotipo',
    otro: 'Otro',
};

// #endregion

@Module({
    name: 'custom.imagenes.title',
    icon: ICONS.INVENTORY,
    apiEndpoint: '/imagenes',
    apiMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    persistent: true,
})
@PrimaryProperty('oid')
@UniquePropertyKey('oid')
@DefaultProperty('nombre')
export class Imagenes extends BaseEntity {
    // #region PROPERTIES

    /** Primary key set from API response — excluded from POST payload. */
    oid?: string;

    // ── Grupo: Imagen ──────────────────────────────────────────────────────

    @PropertyIndex(1)
    @PropertyName('custom.imagenes.fields.nombre', String)
    @Required(true)
    @ViewGroup('custom.imagenes.groups.imagen')
    nombre?: string;

    @PropertyIndex(2)
    @PropertyName('custom.imagenes.fields.descripcion', String)
    @StringTypeDef(StringType.TEXTAREA)
    @HideInListView()
    @ViewGroup('custom.imagenes.groups.imagen')
    descripcion?: string;

    @PropertyIndex(3)
    @PropertyName('custom.imagenes.fields.url_imagen', String)
    @StringTypeDef(StringType.URL_IMAGE)
    @HelpText('custom.imagenes.help.url_imagen')
    @ViewGroup('custom.imagenes.groups.imagen')
    url_imagen?: string;

    @PropertyIndex(4)
    @PropertyName('custom.imagenes.fields.archivo', String)
    @StringTypeDef(StringType.FILE)
    @SupportedFiles(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
    @MaxSizeFiles(10240)
    @HelpText('custom.imagenes.help.archivo')
    @HideInListView()
    @ViewGroup('custom.imagenes.groups.imagen')
    archivo?: string;

    // ── Grupo: Clasificación ───────────────────────────────────────────────

    @PropertyIndex(5)
    @PropertyName('custom.imagenes.fields.categoria', CATEGORIA_IMAGEN)
    @ViewGroup('custom.imagenes.groups.clasif')
    categoria?: string;

    @PropertyIndex(6)
    @PropertyName('custom.imagenes.fields.etiquetas', String)
    @StringTypeDef(StringType.TAGS)
    @MaxTags(15)
    @MaxTagSize(40)
    @HelpText('custom.imagenes.help.etiquetas')
    @HideInListView()
    @ViewGroup('custom.imagenes.groups.clasif')
    etiquetas?: string;

    @PropertyIndex(7)
    @PropertyName('custom.imagenes.fields.color_dominante', String)
    @StringTypeDef(StringType.COLOR)
    @HelpText('custom.imagenes.help.color_dominante')
    @HideInListView()
    @ViewGroup('custom.imagenes.groups.clasif')
    color_dominante?: string;

    @PropertyIndex(8)
    @PropertyName('custom.imagenes.fields.visible', Boolean)
    @ViewGroup('custom.imagenes.groups.clasif')
    visible?: boolean;

    // ── Grupo: Datos técnicos ──────────────────────────────────────────────

    @PropertyIndex(9)
    @PropertyName('custom.imagenes.fields.peso_kb', Number)
    @HideInListView()
    @ViewGroup('custom.imagenes.groups.tecnico')
    peso_kb?: number;

    @PropertyIndex(10)
    @PropertyName('custom.imagenes.fields.fecha_captura', String)
    @StringTypeDef(StringType.DATE)
    @HideInListView()
    @ViewGroup('custom.imagenes.groups.tecnico')
    fecha_captura?: string;

    @PropertyIndex(11)
    @PropertyName('custom.imagenes.fields.hora_captura', String)
    @StringTypeDef(StringType.TIME)
    @HideInListView()
    @ViewGroup('custom.imagenes.groups.tecnico')
    hora_captura?: string;

    @PropertyIndex(12)
    @PropertyName('custom.imagenes.fields.fecha_hora', String)
    @StringTypeDef(StringType.DATETIME)
    @HideInListView()
    @ViewGroup('custom.imagenes.groups.tecnico')
    fecha_hora?: string;

    // ── Grupo: Contacto ────────────────────────────────────────────────────

    @PropertyIndex(13)
    @PropertyName('custom.imagenes.fields.email_contacto', String)
    @StringTypeDef(StringType.EMAIL)
    @HelpText('custom.imagenes.help.email_contacto')
    @HideInListView()
    @ViewGroup('custom.imagenes.groups.contacto')
    email_contacto?: string;

    @PropertyIndex(14)
    @PropertyName('custom.imagenes.fields.url_referencia', String)
    @StringTypeDef(StringType.URL)
    @HideInListView()
    @ViewGroup('custom.imagenes.groups.contacto')
    url_referencia?: string;

    @PropertyIndex(15)
    @PropertyName('custom.imagenes.fields.telefono', String)
    @StringTypeDef(StringType.TELEPHONE)
    @HideInListView()
    @ViewGroup('custom.imagenes.groups.contacto')
    telefono?: string;

    // #endregion
}
