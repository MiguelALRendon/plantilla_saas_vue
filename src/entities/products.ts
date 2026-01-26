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
    @Disabled(true)
    id!: number;

    @PropertyName('Name', String)
    @CSSColumnClass('table-length-short')
    @Required(true, 'El nombre e requerio')
    name!: string;

    @PropertyName('Stringi', StringType)
    grupo!: StringType;

    @ViewGroup('Grupo 2')
    @PropertyName('Description', String)
    @StringTypeDef(StringType.TEXTAREA)
    description!: string;

    @PropertyName('Stock', Number)
    @Mask(' Pz.', MaskSides.END)
    @CSSColumnClass('table-length-short')
    stock!: number;

    @PropertyName('Generic Date', Date)
    genericDate!: Date;

    @PropertyName('Catedral Product', Products)
    Catedral! : Products;

    @ViewGroup('Grupo 3')
    @PropertyName('Is Bolian', Boolean)
    bolian!: boolean;

    @PropertyName('Email', String)
    @StringTypeDef(StringType.EMAIL)
    email!: string;

    @PropertyName('Password', String)
    @StringTypeDef(StringType.PASSWORD)
    password!: string;

    @PropertyName('List', ArrayOf(Products))
    listaProductos!: Array<Products>;
}