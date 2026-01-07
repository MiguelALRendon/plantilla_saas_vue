import { CSSColumnClass } from '@/decorations/css_column_class_decorator.ts';
import { BaseEntity } from './base_entitiy.ts';
import { Column } from '@/decorations/column_name_decorator.ts';
import { Mask } from '@/decorations/mask_decorator.ts';
import { Table } from '@/decorations/table_name_decorator.ts';
import { MaskSides } from '@/enums/mask_sides.ts';

@Table('Productos')
export class Products extends BaseEntity {
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

    @Column('Description')
    description!: string;

    @Column('Stock')
    @Mask(' Pz.', MaskSides.END)
    @CSSColumnClass('table-length-short')
    stock!: number;

    constructor(data: Record<string, any>) {
        super(data);
    }
}