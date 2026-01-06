import { BaseEntity } from './base_entitiy.ts';

export class Products extends BaseEntity {
    @Column('ID')
    id!: number;
    name!: string;
    price!: number;
    description!: string;
    stock!: number;

    constructor(data: Record<string, any>) {
        super(data);
    }
}