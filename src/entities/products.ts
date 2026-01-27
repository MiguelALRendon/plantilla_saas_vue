import { CSSColumnClass, Disabled, ModuleIcon, ModuleName, Required } from '@/decorations';
import { BaseEntity } from './base_entitiy.ts';
import { MaskSides } from '@/enums/mask_sides.ts';
import { StringType } from '@/enums/string_type.ts';
import { PropertyName, Mask, DefaultProperty, StringTypeDef, ViewGroup, ArrayOf } from '@/decorations';
import ICONS from '@/constants/icons.ts';

@DefaultProperty('name')
@ModuleName('Products')
@ModuleIcon(ICONS.PRODUCTS)
export class Products extends BaseEntity {
    @ViewGroup('Grupo 1')
    @PropertyName('ID', Number)
    @CSSColumnClass('table-length-small')
    @Required(true)
    id!: number;

    @PropertyName('Name', String)
    @CSSColumnClass('table-length-short')
    @Disabled(true)
    @Required(true)
    name!: string;

    @PropertyName('Stringi', StringType)
    @Disabled(entity => entity.id == 3)
    @Required(true)
    grupo!: StringType;

    @ViewGroup('Grupo 2')
    @PropertyName('Description', String)
    @StringTypeDef(StringType.TEXTAREA)
    @Disabled(true)
    @Required(true)
    description!: string;

    @PropertyName('Stock', Number)
    @Mask(' Pz.', MaskSides.END)
    @CSSColumnClass('table-length-short')
    @Disabled(true)
    @Required(true)
    stock!: number;

    @PropertyName('Generic Date', Date)
    @Disabled(true)
    @Required(true)
    genericDate!: Date;

    @PropertyName('Catedral Product', Products)
    @Disabled(true)
    @Required(true)
    Catedral! : Products;

    @ViewGroup('Grupo 3')
    @PropertyName('Is Bolian', Boolean)
    @Disabled(true)
    bolian!: boolean;

    @PropertyName('Email', String)
    @StringTypeDef(StringType.EMAIL)
    @Disabled(true)
    @Required(true)
    email!: string;

    @PropertyName('Password', String)
    @StringTypeDef(StringType.PASSWORD)
    @Disabled(true)
    @Required(true)
    password!: string;

    @PropertyName('List', ArrayOf(Products))
    listaProductos!: Array<Products>;
}