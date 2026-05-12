/**
 * ⚠️  ENTIDAD DUMMY DE PRUEBA — ELIMINAR ANTES DE PRODUCCIÓN ⚠️
 *
 * Cubre TODOS los tipos de inputs disponibles en el framework para
 * poder testearlos visualmente en una sola vista.
 *
 * Mapa de inputs cubiertos:
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ PropertyType / StringType       → Componente renderizado            │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │ String (sin StringType)         → TextInputComponent                │
 * │ StringType.EMAIL                → EmailInputComponent               │
 * │ StringType.PASSWORD             → PasswordInputComponent            │
 * │ StringType.TELEPHONE + Mask     → TelephoneInputComponent           │
 * │ StringType.URL                  → UrlInputComponent                 │
 * │ StringType.URL_IMAGE            → UrlImageInputComponent            │
 * │ StringType.TEXTAREA             → TextAreaComponent                 │
 * │ StringType.SEARCH               → SearchInputComponent              │
 * │ StringType.CREDIT_CARD          → CreditCardInputComponent          │
 * │ StringType.CREDIT_CARD_DATE     → CreditCardDateInputComponent      │
 * │ StringType.CREDIT_CARD_CVV      → CreditCardCvvInputComponent       │
 * │ StringType.DATE                 → DateInputComponent (string-based) │
 * │ StringType.TIME                 → HourInputComponent                │
 * │ StringType.DATETIME             → DateTimeInputComponent            │
 * │ StringType.COLOR                → ColorInputComponent               │
 * │ StringType.FILE + extras        → FileUploadInputComponent          │
 * │ StringType.TAGS + extras        → TagInputComponent                 │
 * │ Number                          → NumberInputComponent              │
 * │ Boolean                         → BooleanInputComponent             │
 * │ Date (nativo)                   → DateInputComponent                │
 * │ EnumLike (Language)             → EnumInputComponent                │
 * │ EntityConstructor (Capitulo)    → ObjectInputComponent              │
 * │ ArrayOf(Capitulo)               → ArrayInputComponent               │
 * └─────────────────────────────────────────────────────────────────────┘
 */

import {
    ArrayOf,
    DefaultProperty,
    Disabled,
    DisplayFormat,
    HelpText,
    HideInDetailView,
    HideInListView,
    Mask,
    MaxSizeFiles,
    MaxStringSize,
    MaxTagSize,
    MaxTags,
    Module,
    PrimaryProperty,
    PropertyIndex,
    PropertyName,
    ReadOnly,
    Required,
    StringTypeDef,
    SupportedFiles,
    UniquePropertyKey,
    Validation,
    ViewGroup,
    ViewGroupRowDecorator,
} from '@/decorations';
import { Language } from '@/enums/language';
import { MaskSides } from '@/enums/mask_sides';
import { StringType } from '@/enums/string_type';
import { ViewGroupRow } from '@/enums/view_group_row';
import ICONS from '@/constants/icons';

import { BaseEntity } from './base_entity';
import { Capitulo } from './capitulo';

@Module({
    name: 'custom.super.title',
    icon: ICONS.PRODUCTS,
    apiEndpoint: '/super/',
    apiMethods: ['GET', 'POST', 'PUT', 'DELETE'],
})
@PrimaryProperty('id')
@UniquePropertyKey('id')
@DefaultProperty('texto_normal')
export class Super extends BaseEntity {

    // ── ID (oculto en formularios) ────────────────────────────────────────

    @PropertyIndex(0)
    @PropertyName('ID', String)
    @HideInDetailView()
    @HideInListView()
    id?: string;

    // ── Grupo: Strings de texto ───────────────────────────────────────────
    // Cubre: TextInputComponent, EmailInputComponent, PasswordInputComponent,
    //        TelephoneInputComponent (con máscara)

    @PropertyIndex(1)
    @PropertyName('Texto normal', String)
    @Required(true)
    @ReadOnly((e: Super) => !!e.id)
    @HelpText('Input de texto plano — TextInputComponent. ReadOnly cuando ya está guardado.')
    @ViewGroup('Strings de texto')
    @ViewGroupRowDecorator(ViewGroupRow.SINGLE)
    texto_normal: string = '';

    @PropertyIndex(2)
    @PropertyName('Correo electrónico', String)
    @StringTypeDef(StringType.EMAIL)
    @Required(true)
    @HelpText('Input de email con validación de formato — EmailInputComponent')
    @ViewGroup('Strings de texto')
    @ViewGroupRowDecorator(ViewGroupRow.PAIR)
    email_campo: string = '';

    @PropertyIndex(3)
    @PropertyName('Contraseña', String)
    @StringTypeDef(StringType.PASSWORD)
    @Required(true)
    @HelpText('Input de contraseña con toggle de visibilidad — PasswordInputComponent')
    @ViewGroup('Strings de texto')
    @ViewGroupRowDecorator(ViewGroupRow.PAIR)
    contrasena_campo: string = '';

    @PropertyIndex(4)
    @PropertyName('Teléfono', String)
    @StringTypeDef(StringType.TELEPHONE)
    @Mask('(###) ###-####', MaskSides.START)
    @HelpText('Input de teléfono con máscara (###) ###-#### — TelephoneInputComponent')
    @ViewGroup('Strings de texto')
    @ViewGroupRowDecorator(ViewGroupRow.SINGLE)
    telefono_campo: string = '';

    // ── Grupo: URLs y multimedia ──────────────────────────────────────────
    // Cubre: UrlInputComponent, UrlImageInputComponent

    @PropertyIndex(5)
    @PropertyName('URL', String)
    @StringTypeDef(StringType.URL)
    @HelpText('Input de URL genérica — UrlInputComponent')
    @ViewGroup('URLs y multimedia')
    @ViewGroupRowDecorator(ViewGroupRow.PAIR)
    url_campo: string = '';

    @PropertyIndex(6)
    @PropertyName('URL de imagen', String)
    @StringTypeDef(StringType.URL_IMAGE)
    @DisplayFormat((v: unknown) => (v ? `🖼 ${v}` : '—'))
    @HelpText('Input de URL de imagen con preview integrado — UrlImageInputComponent')
    @ViewGroup('URLs y multimedia')
    @ViewGroupRowDecorator(ViewGroupRow.PAIR)
    url_imagen_campo: string = '';

    // ── Grupo: Texto largo ────────────────────────────────────────────────
    // Cubre: TextAreaComponent, SearchInputComponent

    @PropertyIndex(7)
    @PropertyName('Área de texto', String)
    @StringTypeDef(StringType.TEXTAREA)
    @HelpText('Textarea multilínea expandible — TextAreaComponent')
    @ViewGroup('Texto largo')
    @ViewGroupRowDecorator(ViewGroupRow.SINGLE)
    textarea_campo: string = '';

    @PropertyIndex(8)
    @PropertyName('Campo de búsqueda', String)
    @StringTypeDef(StringType.SEARCH)
    @HelpText('Input de búsqueda con ícono — SearchInputComponent')
    @ViewGroup('Texto largo')
    @ViewGroupRowDecorator(ViewGroupRow.SINGLE)
    busqueda_campo: string = '';

    // ── Grupo: Tarjeta de crédito ─────────────────────────────────────────
    // Cubre: CreditCardInputComponent, CreditCardDateInputComponent,
    //        CreditCardCvvInputComponent

    @PropertyIndex(9)
    @PropertyName('Número de tarjeta', String)
    @StringTypeDef(StringType.CREDIT_CARD)
    @Required(true)
    @HelpText('Número completo de tarjeta con formato ####-####-####-#### — CreditCardInputComponent')
    @ViewGroup('Tarjeta de crédito')
    @ViewGroupRowDecorator(ViewGroupRow.SINGLE)
    tarjeta_numero: string = '';

    @PropertyIndex(10)
    @PropertyName('Fecha de vencimiento', String)
    @StringTypeDef(StringType.CREDIT_CARD_DATE)
    @Required(true)
    @HelpText('Vencimiento en formato MM/AA — CreditCardDateInputComponent')
    @ViewGroup('Tarjeta de crédito')
    @ViewGroupRowDecorator(ViewGroupRow.PAIR)
    tarjeta_fecha: string = '';

    @PropertyIndex(11)
    @PropertyName('CVV', String)
    @StringTypeDef(StringType.CREDIT_CARD_CVV)
    @Required(true)
    @HelpText('Código de seguridad de 3 o 4 dígitos — CreditCardCvvInputComponent')
    @ViewGroup('Tarjeta de crédito')
    @ViewGroupRowDecorator(ViewGroupRow.PAIR)
    tarjeta_cvv: string = '';

    // ── Grupo: Fechas y horas ─────────────────────────────────────────────
    // Cubre: DateInputComponent (x2: string y Date nativo),
    //        HourInputComponent, DateTimeInputComponent

    @PropertyIndex(12)
    @PropertyName('Fecha (string)', String)
    @StringTypeDef(StringType.DATE)
    @HelpText('Selector de fecha vía StringType.DATE — DateInputComponent')
    @ViewGroup('Fechas y horas')
    @ViewGroupRowDecorator(ViewGroupRow.TRIPLE)
    fecha_string: string = '';

    @PropertyIndex(13)
    @PropertyName('Hora', String)
    @StringTypeDef(StringType.TIME)
    @HelpText('Selector de hora — HourInputComponent')
    @ViewGroup('Fechas y horas')
    @ViewGroupRowDecorator(ViewGroupRow.TRIPLE)
    hora_campo: string = '';

    @PropertyIndex(14)
    @PropertyName('Fecha y hora', String)
    @StringTypeDef(StringType.DATETIME)
    @HelpText('Selector combinado de fecha + hora — DateTimeInputComponent')
    @ViewGroup('Fechas y horas')
    @ViewGroupRowDecorator(ViewGroupRow.TRIPLE)
    fecha_hora_campo: string = '';

    @PropertyIndex(15)
    @PropertyName('Fecha nativa', Date)
    @HelpText('Tipo Date nativo (no StringType) — DateInputComponent con binding a objeto Date')
    @ViewGroup('Fechas y horas')
    @ViewGroupRowDecorator(ViewGroupRow.SINGLE)
    fecha_nativa?: Date;

    // ── Grupo: Especiales ─────────────────────────────────────────────────
    // Cubre: ColorInputComponent, FileUploadInputComponent, TagInputComponent

    @PropertyIndex(16)
    @PropertyName('Color', String)
    @StringTypeDef(StringType.COLOR)
    @HelpText('Selector de color con paleta — ColorInputComponent')
    @ViewGroup('Especiales')
    @ViewGroupRowDecorator(ViewGroupRow.TRIPLE)
    color_campo: string = '#3b82f6';

    @PropertyIndex(17)
    @PropertyName('Archivo', String)
    @StringTypeDef(StringType.FILE)
    @SupportedFiles(['image/png', 'image/jpeg', 'application/pdf'])
    @MaxSizeFiles(5)
    @HelpText('Subida de archivo (PNG, JPG, PDF — máx. 5 MB) — FileUploadInputComponent')
    @ViewGroup('Especiales')
    @ViewGroupRowDecorator(ViewGroupRow.TRIPLE)
    archivo_campo: string = '';

    @PropertyIndex(18)
    @PropertyName('Etiquetas', String)
    @StringTypeDef(StringType.TAGS)
    @MaxTags(8)
    @MaxTagSize(20)
    @MaxStringSize(200)
    @HelpText('Ingresa etiquetas (máx. 8, 20 chars c/u) — TagInputComponent')
    @ViewGroup('Especiales')
    @ViewGroupRowDecorator(ViewGroupRow.TRIPLE)
    etiquetas_campo: string = '';

    // ── Grupo: Tipos nativos ──────────────────────────────────────────────
    // Cubre: NumberInputComponent, BooleanInputComponent, EnumInputComponent

    @PropertyIndex(19)
    @PropertyName('Número', Number)
    @Required(true)
    @Validation(
        (e: Super) => e.numero_campo >= 0,
        'El número debe ser mayor o igual a cero'
    )
    @DisplayFormat((v: unknown) => `${Number(v).toLocaleString('es-MX')}`)
    @HelpText('Input numérico con validación ≥ 0 — NumberInputComponent')
    @ViewGroup('Tipos nativos')
    @ViewGroupRowDecorator(ViewGroupRow.TRIPLE)
    numero_campo: number = 0;

    @PropertyIndex(20)
    @PropertyName('Activo', Boolean)
    @HelpText('Toggle booleano — BooleanInputComponent')
    @ViewGroup('Tipos nativos')
    @ViewGroupRowDecorator(ViewGroupRow.TRIPLE)
    activo_campo: boolean = false;

    @PropertyIndex(21)
    @PropertyName('Idioma', Language)
    @HelpText('Selector de enum (Language: ES/EN/JP) — EnumInputComponent')
    @ViewGroup('Tipos nativos')
    @ViewGroupRowDecorator(ViewGroupRow.TRIPLE)
    idioma_campo?: Language;

    // ── Grupo: Relaciones ─────────────────────────────────────────────────
    // Cubre: ObjectInputComponent (EntityConstructor), ArrayInputComponent (ArrayOf)

    @PropertyIndex(22)
    @PropertyName('Capítulo relacionado', Capitulo)
    @Disabled((e: Super) => !e.id)
    @HelpText('Selector de entidad relacionada — ObjectInputComponent. Habilitado sólo si ya está guardado.')
    @ViewGroup('Relaciones')
    @ViewGroupRowDecorator(ViewGroupRow.SINGLE)
    capitulo_rel?: Capitulo;

    @PropertyIndex(23)
    @PropertyName('Lista de capítulos', ArrayOf(Capitulo))
    @Disabled((e: Super) => !e.id)
    @HelpText('Lista de entidades relacionadas (1:N) — ArrayInputComponent. Habilitado sólo si ya está guardado.')
    @ViewGroup('Relaciones')
    @ViewGroupRowDecorator(ViewGroupRow.SINGLE)
    capitulos_lista?: Capitulo[];

    // ── Campos de respuesta de la API (sin @PropertyName) ─────────────────

    created_at?: string;
    updated_at?: string;
    estatus?: number;
}
