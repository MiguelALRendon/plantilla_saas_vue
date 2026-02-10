import { CSSColumnClass, Disabled, ModuleIcon, ModuleName, Required, Validation, HideInListView, ApiEndpoint, ApiMethods, PrimaryProperty, DisplayFormat, HelpText, PropertyIndex, AsyncValidation, TabOrder, Persistent, UniquePropertyKey } from '@/decorations';
import { StringType } from '@/enums/string_type.ts';
import { PropertyName, DefaultProperty, StringTypeDef, ViewGroup, ArrayOf, HideInDetailView } from '@/decorations';
import ICONS from '@/constants/icons.ts';
import { BaseEntity } from './base_entitiy.ts';

@DefaultProperty('name')
@PrimaryProperty('id')
@UniquePropertyKey('id')
@ModuleName('Products')
@ModuleIcon(ICONS.PRODUCTS)
@ApiEndpoint('/api/products')
@ApiMethods(['GET', 'POST', 'PUT', 'DELETE'])
@Persistent()
export class Products extends BaseEntity {
    @ViewGroup('Grupo 1')
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    @CSSColumnClass('table-length-small')
    @Required(true)
    @HideInDetailView()
    id!: number;

    @PropertyIndex(2)
    @PropertyName('Name', String)
    @CSSColumnClass('table-length-short')
    @Required(true)
    @HelpText('Nombre del producto que se mostrará a los clientes')
    @HideInListView()
    name!: string;

    @PropertyIndex(3)
    @PropertyName('Stringi', StringType)
    @Disabled(entity => entity.id == 3)
    @Required(true)
    grupo!: StringType;

    @ViewGroup('Grupo 2')
    @PropertyIndex(4)
    @PropertyName('Description', String)
    @StringTypeDef(StringType.TEXTAREA)
    @Required(true)
    @HelpText('Descripción detallada del producto')
    description!: string;

    @PropertyIndex(5)
    @PropertyName('Stock', Number)
    @DisplayFormat('{value} Pz.')
    @HelpText('Cantidad disponible en inventario')
    @CSSColumnClass('table-length-short')
    @Required(true)
    stock!: number;

    @PropertyIndex(6)
    @PropertyName('Generic Date', Date)
    @Required(true)
    genericDate!: Date;

    @PropertyIndex(7)
    @PropertyName('Catedral Product', Products)
    @Required(true)
    Catedral! : Products;

    @ViewGroup('Grupo 3')
    @PropertyIndex(8)
    @PropertyName('Is Bolian', Boolean)
    bolian!: boolean;

    @PropertyIndex(9)
    @PropertyName('Email', String)
    @StringTypeDef(StringType.EMAIL)
    @Required(true)
    @HelpText('Email de contacto del proveedor')
    @AsyncValidation(async (entity) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return !entity.email?.endsWith('@test.com');
    }, 'El email no puede terminar en @test.com')
    email!: string;

    @PropertyIndex(10)
    @PropertyName('Password', String)
    @StringTypeDef(StringType.PASSWORD)
    @Required(true)
    password!: string;

    @TabOrder(1)
    @Required(true)
    @Validation((entity) => entity.listaProductos?.length > 3, "La cantidad minima tiene que ser mayor a 3")
    @PropertyName('List', ArrayOf(Products))
    listaProductos!: Array<Products>;
}