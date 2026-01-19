import { CSSColumnClass, ModuleIcon, ModuleName } from '@/decorations';
import { BaseEntity } from './base_entitiy.ts';
import { MaskSides } from '@/enums/mask_sides.ts';
import { StringType } from '@/enums/string_type.ts';
import { PropertyName, Mask, DefaultProperty, StringTypeDef, ViewGroup, ViewGroupRowDecorator } from '@/decorations';
import { ViewGroupRow } from '@/enums/view_group_row.ts';
import ICONS from '@/constants/icons.ts';

@DefaultProperty('name')
@ModuleName('Products')
@ModuleIcon(ICONS.PRODUCTS)
export class Products extends BaseEntity {
    @ViewGroup('Grupo 1')
    @PropertyName('ID', Number)
    @CSSColumnClass('table-length-small')
    id!: number;

    @PropertyName('Name', String)
    @CSSColumnClass('table-length-short')
    name!: string;

    @PropertyName('Price', Number)
    @Mask('$', MaskSides.START)
    @CSSColumnClass('table-length-small')
    price!: number;

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

    @PropertyName('Inner Product', Products)
    @ViewGroupRowDecorator(ViewGroupRow.SINGLE)
    product! : Products;

    @PropertyName('Is Bolian', Boolean)
    bolian!: boolean;
}