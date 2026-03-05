import ICONS from '@/constants/icons.ts';
import {
    ApiEndpoint,
    ApiMethods,
    CSSColumnClass,
    DefaultProperty,
    HideInDetailView,
    ModuleIcon,
    ModuleName,
    Persistent,
    PrimaryProperty,
    PropertyIndex,
    PropertyName,
    Required,
    StringTypeDef,
    UniquePropertyKey,
} from '@/decorations';
import { StringType } from '@/enums/string_type.ts';
import { BaseEntity } from './base_entity.ts';

/**
 * Customer entity class for managing customer data in the system.
 * Provides a complete CRUD module for UC-001 (Quick Start) acceptance scenario.
 * Extends BaseEntity with decorator-driven metadata for auto-generated forms and tables.
 */
@DefaultProperty('name')
@PrimaryProperty('id')
@UniquePropertyKey('id')
@ModuleName('Customer')
@ModuleIcon(ICONS.AVATAR)
@ApiEndpoint('/api/customers')
@ApiMethods(['GET', 'POST', 'PUT', 'DELETE'])
@Persistent()
export class Customer extends BaseEntity {

    // #region PROPERTIES

    /**
     * Unique identifier for the customer.
     * Auto-assigned by the backend; hidden in detail view to prevent accidental edits.
     */
    @PropertyIndex(0)
    @PropertyName('ID', Number)
    @CSSColumnClass('table-length-small')
    @HideInDetailView()
    id!: number;

    /**
     * Full display name of the customer.
     * Required field shown in both list and detail views.
     */
    @PropertyIndex(1)
    @PropertyName('Name', String)
    @CSSColumnClass('col-6')
    @Required(true, 'Customer name is required')
    name!: string;

    /**
     * Contact email address.
     * Uses the EMAIL StringType to render EmailInputComponent in detail view.
     */
    @PropertyIndex(2)
    @PropertyName('Email', String)
    @CSSColumnClass('col-4')
    @StringTypeDef(StringType.EMAIL)
    @Required(true, 'Email is required')
    email!: string;

    /**
     * Contact phone number.
     * Uses the TELEPHONE StringType for phone-format masking in inputs.
     */
    @PropertyIndex(3)
    @PropertyName('Phone', String)
    @CSSColumnClass('col-3')
    @StringTypeDef(StringType.TELEPHONE)
    phone?: string;

    // #endregion
}
