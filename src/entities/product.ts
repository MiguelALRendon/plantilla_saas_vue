import ICONS from '@/constants/icons.ts';
import {
    ApiEndpoint,
    ApiMethods,
    ArrayOf,
    AsyncValidation,
    CSSColumnClass,
    DefaultProperty,
    DefaultViewButtonList,
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
import { DefaultButtonLists } from '@/constants/default_button_lists';
import { StringType } from '@/enums/string_type.ts';
import { /*AsyncValidators, */Validators } from '@/validators';

import { BaseEntity } from './base_entity.ts';

/**
 * Product entity class for managing product data in the system.
 * Extends BaseEntity to leverage meta-programming decorators for auto-generation of CRUD operations.
 * Uses decorators to define validation rules, API endpoints, display formatting, and persistence behavior.
 */
@DefaultProperty('name')
@PrimaryProperty('id')
@UniquePropertyKey('id')
@ModuleName('custom.products.title')
@DefaultViewButtonList(DefaultButtonLists.ListView)
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
    @ViewGroup('custom.products.groups.group_1')
    @PropertyIndex(1)
    @PropertyName('custom.products.fields.id', Number)
    @CSSColumnClass('table-length-small')
    @Required(true)
    @HideInDetailView() @HideInListView()
    id!: number;

    /**
     * Display name of the product shown to customers.
     * Required field, hidden in list view for space optimization.
     */
    @PropertyIndex(2)
    @PropertyName('custom.products.fields.name', String)
    @CSSColumnClass('table-length-short')
    @Required(true)
    @HelpText('custom.products.help.name')
    name!: string;

    /**
     * String type classification for the product.
     * Required field, disabled when product ID equals 3.
     */
    @PropertyIndex(3)
    @PropertyName('custom.products.fields.grupo', StringType)
    @Disabled((entity: Product) => entity.id == 3)
    @Required(true)
    grupo!: StringType;

    /**
     * Detailed description of the product displayed as multi-line textarea.
     * Required field providing comprehensive product information.
     */
    @ViewGroup('custom.products.groups.group_2')
    @PropertyIndex(4)
    @PropertyName('custom.products.fields.description', String)
    @StringTypeDef(StringType.TEXTAREA)
    @Required(true)
    @HelpText('custom.products.help.description')
    description!: string;

    /**
     * Current stock quantity available in inventory.
     * Required field, displayed with 'Pz.' unit suffix.
     */
    @PropertyIndex(5)
    @PropertyName('custom.products.fields.stock', Number)
    @DisplayFormat('{value} Pz.')
    @HelpText('custom.products.help.stock')
    @CSSColumnClass('table-length-short')
    @Validators.min(0, 'custom.products.validation.stock_min')
    @Required(true)
    stock!: number;

    /**
     * Generic date field for product-related temporal data.
     * Required field with date picker input.
     */
    @PropertyIndex(6)
    @PropertyName('custom.products.fields.genericDate', Date)
    @Required(true)
    genericDate!: Date;

    /**
     * Self-referential relationship to another Product entity.
     * Required field enabling product hierarchies or associations.
     */
    @PropertyIndex(7)
    @PropertyName('custom.products.fields.catedral', Product)
    @Required(true)
    Catedral!: Product;

    /**
     * Boolean flag indicating Bolian classification status.
     * Optional field for categorical classification.
     */
    @ViewGroup('custom.products.groups.group_3')
    @PropertyIndex(8)
    @PropertyName('custom.products.fields.bolian', Boolean)
    bolian!: boolean;

    /**
     * Supplier contact email address with async validation.
     * Required field, must not end with '@test.com' domain.
     */
    @PropertyIndex(9)
    @PropertyName('custom.products.fields.email', String)
    @StringTypeDef(StringType.EMAIL)
    @Validators.email('custom.products.validation.invalid_email')
    // @AsyncValidators.unique('/api/products/validate-email', 'El email ya está registrado')
    @Required(true)
    @HelpText('custom.products.help.email')
    @AsyncValidation(async (entity: Product) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return !entity.email?.endsWith('@test.com');
    }, 'custom.products.validation.email_test_domain')
    email!: string;

    /**
     * Password field for secure authentication.
     * Required field, masked input for security.
     */
    @PropertyIndex(10)
    @PropertyName('custom.products.fields.password', String)
    @StringTypeDef(StringType.PASSWORD)
    @Required(true)
    password!: string;

    @PropertyIndex(11)
    @PropertyName('custom.products.fields.phone', String)
    @StringTypeDef(StringType.TELEPHONE)
    @HelpText('custom.products.help.phone')
    phone!: string;

    @PropertyIndex(12)
    @PropertyName('custom.products.fields.websiteUrl', String)
    @StringTypeDef(StringType.URL)
    @HelpText('custom.products.help.websiteUrl')
    websiteUrl!: string;

    @PropertyIndex(13)
    @PropertyName('custom.products.fields.imageUrl', String)
    @StringTypeDef(StringType.URL_IMAGE)
    @HelpText('custom.products.help.imageUrl')
    imageUrl!: string;

    @PropertyIndex(14)
    @PropertyName('custom.products.fields.searchQuery', String)
    @StringTypeDef(StringType.SEARCH)
    searchQuery!: string;

    @PropertyIndex(15)
    @PropertyName('custom.products.fields.cardNumber', String)
    @StringTypeDef(StringType.CREDIT_CARD)
    @HelpText('custom.products.help.cardNumber')
    cardNumber!: string;

    @PropertyIndex(16)
    @PropertyName('custom.products.fields.cardDate', String)
    @StringTypeDef(StringType.CREDIT_CARD_DATE)
    @HelpText('custom.products.help.cardDate')
    cardDate!: string;

    @PropertyIndex(17)
    @PropertyName('custom.products.fields.cardCvv', String)
    @StringTypeDef(StringType.CREDIT_CARD_CVV)
    @HelpText('custom.products.help.cardCvv')
    cardCvv!: string;

    /**
     * Array of related Product entities forming a collection.
     * Required field with validation ensuring minimum of 4 products in the list.
     */
    @TabOrder(1)
    @Required(true)
    @Validation((entity: Product) => entity.listaProductos?.length > 3, 'custom.products.validation.min_list_items')
    @PropertyName('custom.products.fields.list', ArrayOf(Product))
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
