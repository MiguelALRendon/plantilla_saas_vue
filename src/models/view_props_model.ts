import { BaseEntity } from '@/entities/base_entitiy';
import { DetailTypes } from '@/enums/detail_type';

export interface ViewPropsModel {
    viewEntity : BaseEntity;
    viewType: DetailTypes;
}