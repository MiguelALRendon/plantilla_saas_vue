import { CSSColumnClass, Disabled, ModuleIcon, ModuleName, Required, Validation, HideInListView, ApiEndpoint, ApiMethods, PrimaryProperty } from '@/decorations';
import { MaskSides } from '@/enums/mask_sides.ts';
import { StringType } from '@/enums/string_type.ts';
import { PropertyName, Mask, DefaultProperty, StringTypeDef, ViewGroup, ArrayOf, HideInDetailView } from '@/decorations';
import ICONS from '@/constants/icons.ts';
import { PersistentEntity } from './persistent_entity.ts';

@DefaultProperty('name')
@PrimaryProperty('id')
@ModuleName('Products')
@ModuleIcon(ICONS.PRODUCTS)
@ApiEndpoint('/api/products')
@ApiMethods(['GET', 'POST', 'PUT', 'DELETE'])
export class Products extends PersistentEntity {
    @ViewGroup('Grupo 1')
    @PropertyName('ID', Number)
    @CSSColumnClass('table-length-small')
    @Required(true)
    @HideInDetailView()
    id!: number;

    @PropertyName('Name', String)
    @CSSColumnClass('table-length-short')
    @Required(true)
    @HideInListView()
    name!: string;

    @PropertyName('Stringi', StringType)
    @Disabled(entity => entity.id == 3)
    @Required(true)
    grupo!: StringType;

    @ViewGroup('Grupo 2')
    @PropertyName('Description', String)
    @StringTypeDef(StringType.TEXTAREA)
    @Required(true)
    description!: string;

    @PropertyName('Stock', Number)
    @Mask(' Pz.', MaskSides.END)
    @CSSColumnClass('table-length-short')
    @Required(true)
    stock!: number;

    @PropertyName('Generic Date', Date)
    @Required(true)
    genericDate!: Date;

    @PropertyName('Catedral Product', Products)
    @Required(true)
    Catedral! : Products;

    @ViewGroup('Grupo 3')
    @PropertyName('Is Bolian', Boolean)
    bolian!: boolean;

    @PropertyName('Email', String)
    @StringTypeDef(StringType.EMAIL)
    @Required(true)
    email!: string;

    @PropertyName('Password', String)
    @StringTypeDef(StringType.PASSWORD)
    @Required(true)
    password!: string;

    @Required(true)
    @Validation((entity) => entity.listaProductos?.length > 3, "La cantidad minima tiene que ser mayor a 3")
    @PropertyName('List', ArrayOf(Products))
    listaProductos!: Array<Products>;
}