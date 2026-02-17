import ICONS from '@/constants/icons.ts';
import {
    ApiEndpoint,
    ApiMethods,
    ArrayOf,
    AsyncValidation,
    CSSColumnClass,
    DefaultProperty,
    Disabled,
    DisplayFormat,
    HelpText,
    HideInDetailView,
    HideInListView,
    ModuleIcon,
    ModuleName,
    Persistent,
    PrimaryProperty,
    PropertyIndex,
    PropertyName,
    Required,
    StringTypeDef,
    TabOrder,
    UniquePropertyKey,
    Validation,
    ViewGroup,
} from '@/decorations';
import { StringType } from '@/enums/string_type.ts';

import { BaseEntity } from './base_entity.ts';

/**
 * Product entity class for managing product data in the system.
 * Extends BaseEntity to leverage meta-programming decorators for auto-generation of CRUD operations.
 * Uses decorators to define validation rules, API endpoints, display formatting, and persistence behavior.
 */
@DefaultProperty('name')
@PrimaryProperty('id')
@UniquePropertyKey('id')
@ModuleName('Products')
@ModuleIcon(ICONS.PRODUCTS)
@ApiEndpoint('/api/products')
@ApiMethods(['GET', 'POST', 'PUT', 'DELETE'])
@Persistent()
export class Product extends BaseEntity {
    /**
     * @region PROPERTIES
     * Product properties with validation and display metadata
     */
    /**
     * Unique identifier for the product in the database.
     * Required field, hidden in detail view.
     */
    @ViewGroup('Grupo 1')
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    @CSSColumnClass('table-length-small')
    @Required(true)
    @HideInDetailView()
    id!: number;

    /**
     * Display name of the product shown to customers.
     * Required field, hidden in list view for space optimization.
     */
    @PropertyIndex(2)
    @PropertyName('Name', String)
    @CSSColumnClass('table-length-short')
    @Required(true)
    @HelpText('Nombre del producto que se mostrará a los clientes')
    @HideInListView()
    name!: string;

    /**
     * String type classification for the product.
     * Required field, disabled when product ID equals 3.
     */
    @PropertyIndex(3)
    @PropertyName('Stringi', StringType)
    @Disabled((entity: Product) => entity.id == 3)
    @Required(true)
    grupo!: StringType;

    /**
     * Detailed description of the product displayed as multi-line textarea.
     * Required field providing comprehensive product information.
     */
    @ViewGroup('Grupo 2')
    @PropertyIndex(4)
    @PropertyName('Description', String)
    @StringTypeDef(StringType.TEXTAREA)
    @Required(true)
    @HelpText('Descripción detallada del producto')
    description!: string;

    /**
     * Current stock quantity available in inventory.
     * Required field, displayed with 'Pz.' unit suffix.
     */
    @PropertyIndex(5)
    @PropertyName('Stock', Number)
    @DisplayFormat('{value} Pz.')
    @HelpText('Cantidad disponible en inventario')
    @CSSColumnClass('table-length-short')
    @Required(true)
    stock!: number;

    /**
     * Generic date field for product-related temporal data.
     * Required field with date picker input.
     */
    @PropertyIndex(6)
    @PropertyName('Generic Date', Date)
    @Required(true)
    genericDate!: Date;

    /**
     * Self-referential relationship to another Product entity.
     * Required field enabling product hierarchies or associations.
     */
    @PropertyIndex(7)
    @PropertyName('Catedral Product', Product)
    @Required(true)
    Catedral!: Product;

    /**
     * Boolean flag indicating Bolian classification status.
     * Optional field for categorical classification.
     */
    @ViewGroup('Grupo 3')
    @PropertyIndex(8)
    @PropertyName('Is Bolian', Boolean)
    bolian!: boolean;

    /**
     * Supplier contact email address with async validation.
     * Required field, must not end with '@test.com' domain.
     */
    @PropertyIndex(9)
    @PropertyName('Email', String)
    @StringTypeDef(StringType.EMAIL)
    @Required(true)
    @HelpText('Email de contacto del proveedor')
    @AsyncValidation(async (entity: Product) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return !entity.email?.endsWith('@test.com');
    }, 'El email no puede terminar en @test.com')
    email!: string;

    /**
     * Password field for secure authentication.
     * Required field, masked input for security.
     */
    @PropertyIndex(10)
    @PropertyName('Password', String)
    @StringTypeDef(StringType.PASSWORD)
    @Required(true)
    password!: string;

    /**
     * Array of related Product entities forming a collection.
     * Required field with validation ensuring minimum of 4 products in the list.
     */
    @TabOrder(1)
    @Required(true)
    @Validation((entity: Product) => entity.listaProductos?.length > 3, 'La cantidad minima tiene que ser mayor a 3')
    @PropertyName('List', ArrayOf(Product))
    listaProductos!: Array<Product>;
    /**
     * @endregion
     */

    /**
     * @region METHODS
     * Custom business logic methods for Product entity
     */
    /**
     * @endregion
     */

    /**
     * @region METHODS OVERRIDES
     * Overridden BaseEntity methods for Product-specific behavior
     */
    /**
     * @endregion
     */
}
