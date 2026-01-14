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
    @PropertyName('ID')
    @CSSColumnClass('table-length-small')
    @ViewGroupRowDecorator(ViewGroupRow.SINGLE)
    id!: number;

    @PropertyName('Name')
    @CSSColumnClass('table-length-short')
    name!: string;

    @PropertyName('Price')
    @Mask('$', MaskSides.START)
    @CSSColumnClass('table-length-small')
    price!: number;

    @ViewGroup('Grupo 2')
    @PropertyName('Description')
    @StringTypeDef(StringType.TEXTAREA)
    @ViewGroupRowDecorator(ViewGroupRow.TRIPLE)
    description!: string;

    @PropertyName('Stock')
    @Mask(' Pz.', MaskSides.END)
    @CSSColumnClass('table-length-short')
    @ViewGroupRowDecorator(ViewGroupRow.TRIPLE)
    stock!: number;

    @PropertyName('Generic Date')
    @ViewGroupRowDecorator(ViewGroupRow.TRIPLE)
    genericDate!: Date;

    @PropertyName('Catedral Product')
    @ViewGroupRowDecorator(ViewGroupRow.SINGLE)
    Catedral! : Products;

    @PropertyName('Inner Product')
    @ViewGroupRowDecorator(ViewGroupRow.SINGLE)
    product! : Products;
}