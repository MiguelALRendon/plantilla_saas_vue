import { BaseEntity } from './base_entitiy.ts';
import { Column } from '@/decorations/column_name_decorator.ts';
import { Mask } from '@/decorations/mask_decorator.ts';
import { Table } from '@/decorations/table_name_decorator.ts';
import { MaskSides } from '@/enums/mask_sides.ts';

@Table('Productos')
export class Products extends BaseEntity {
    @Column('ID')
    id!: number;

    @Column('Name')
    name!: string;

    @Column('Price')
    @Mask('$', MaskSides.START)
    price!: number;

    @Column('Description')
    description!: string;

    @Column('Stock')
    @Mask(' Pz.', MaskSides.END)
    stock!: number;

    constructor(data: Record<string, any>) {
        super(data);
    }
}