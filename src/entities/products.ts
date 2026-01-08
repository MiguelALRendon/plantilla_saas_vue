import { CSSColumnClass } from '@/decorations/css_column_class_decorator.ts';
import { BaseEntity } from './base_entitiy.ts';
import { Column } from '@/decorations/column_name_decorator.ts';
import { Mask } from '@/decorations/mask_decorator.ts';
import { Table } from '@/decorations/table_name_decorator.ts';
import { MaskSides } from '@/enums/mask_sides.ts';
import { DefaultProperty } from '@/decorations/default_property_decorator.ts';
import { StringTypeDef } from '@/decorations/string_type_decorator.ts';
import { StringType } from '@/enums/string_type.ts';
import { ViewGroup } from '@/decorations/view_group_decorator.ts';

@Table('Productos')
@DefaultProperty('name')
export class Products extends BaseEntity {
    @ViewGroup('Grupo 1')
    @Column('ID')
    @CSSColumnClass('table-length-small')
    id!: number;

    @Column('Name')
    @CSSColumnClass('table-length-short')
    name!: string;

    @Column('Price')
    @Mask('$', MaskSides.START)
    @CSSColumnClass('table-length-small')
    price!: number;

    @ViewGroup('Grupo 2')
    @Column('Description')
    @StringTypeDef(StringType.TEXTAREA)
    description!: string;

    @Column('Stock')
    @Mask(' Pz.', MaskSides.END)
    @CSSColumnClass('table-length-short')
    stock!: number;

    constructor(data: Record<string, any>) {
        super(data);
    }
}