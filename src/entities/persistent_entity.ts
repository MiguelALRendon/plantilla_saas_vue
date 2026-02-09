import { Disabled, HideInDetailView, HideInListView, PropertyName, UniquePropertyKey } from "@/decorations";
import type { HttpMethod } from "@/decorations";
import { BaseEntity } from "./base_entitiy";
import Application from "@/models/application";
import { confMenuType } from "@/enums/conf_menu_type";
import { ToastType } from "@/enums/ToastType";

@UniquePropertyKey('oid')
export abstract class PersistentEntity extends BaseEntity {

    private _originalState: Record<string, any>;
    private _isSaving: boolean = false;

    constructor(data: Record<string, any>) {
        super(data);
        this._originalState = structuredClone(this.toObject());
    }

    @PropertyName("Oid", String)
    @HideInDetailView() @HideInListView()
    @Disabled(true)
    public oid! : string;

    public get getSaving(): boolean {
        return this._isSaving;
    }

    public isNew(): boolean {
        return this.getPrimaryPropertyValue() === undefined || this.getPrimaryPropertyValue() === null;
    }

    private validatePersistenceConfiguration(): boolean {
        if (!(this as any).validateModuleConfiguration()) {
            return false;
        }
        
        const errors: string[] = [];
        
        if (!this.getUniquePropertyKey()) {
            errors.push('La entidad no tiene definido @UniquePropertyKey');
        }
        
        if (!this.getApiEndpoint()) {
            errors.push('La entidad no tiene definido @ApiEndpoint');
        }
        
        if (!this.getApiMethods()) {
            errors.push('La entidad no tiene definido @ApiMethods');
        }
        
        if (errors.length > 0) {
            Application.ApplicationUIService.openConfirmationMenu(
                confMenuType.ERROR,
                'Error de configuración de persistencia',
                errors.join('\n'),
                undefined,
                'Aceptar',
                'Cerrar'
            );
            return false;
        }
        
        return true;
    }

    private validateApiMethod(method: HttpMethod): boolean {
        if (!this.isApiMethodAllowed(method)) {
            Application.ApplicationUIService.openConfirmationMenu(
                confMenuType.ERROR,
                'Método no permitido',
                `El método ${method} no está permitido en esta entidad`,
                undefined,
                'Aceptar',
                'Cerrar'
            );
            return false;
        }
        return true;
    }

    public static async getElement<T extends PersistentEntity>(this: new (data: Record<string, any>) => T, oid: string): Promise<T> {
        const endpoint = (this as any).getApiEndpoint();
        
        if (!endpoint) {
            throw new Error('ApiEndpoint no definido');
        }
        
        try {
            const response = await Application.axiosInstance.get(`${endpoint}/${oid}`);
            const mappedData = (this as any).mapFromPersistentKeys(response.data);
            const instance = new this(mappedData);
            (instance as any).afterGetElement();
            return instance;
        } catch (error: any) {
            const tempInstance = new this({});
            (tempInstance as any).getElementFailed();
            Application.ApplicationUIService.openConfirmationMenu(
                confMenuType.ERROR,
                'Error al obtener elemento',
                error.response?.data?.message || error.message || 'Error desconocido',
                undefined,
                'Aceptar',
                'Cerrar'
            );
            throw error;
        }
    }

    public static async getElementList<T extends PersistentEntity>(this: new (data: Record<string, any>) => T, filter: string = ''): Promise<T[]> {
        const endpoint = (this as any).getApiEndpoint();
        
        if (!endpoint) {
            throw new Error('ApiEndpoint no definido');
        }
        
        try {
            const response = await Application.axiosInstance.get(endpoint, { params: { filter } });
            const instances = response.data.map((item: any) => {
                const mappedData = (this as any).mapFromPersistentKeys(item);
                return new this(mappedData);
            });
            if (instances.length > 0) {
                (instances[0] as any).afterGetElementList();
            }
            return instances;
        } catch (error: any) {
            const tempInstance = new this({});
            (tempInstance as any).getElementListFailed();
            Application.ApplicationUIService.openConfirmationMenu(
                confMenuType.ERROR,
                'Error al obtener lista',
                error.response?.data?.message || error.message || 'Error desconocido',
                undefined,
                'Aceptar',
                'Cerrar'
            );
            throw error;
        }
    }

    public async save(): Promise<this> {
        if (!this.validatePersistenceConfiguration()) {
            return this;
        }
        
        if (!this.validateApiMethod(this.isNew() ? 'POST' : 'PUT')) {
            return this;
        }

        if (!await this.validateInputs()) {
            return this;
        }
        
        this._isSaving = true;
        this.beforeSave();
        Application.ApplicationUIService.showLoadingMenu();
        await new Promise(resolve => setTimeout(resolve, 400));
        
        try {
            this.onSaving();
            const endpoint = this.getApiEndpoint();
            const dataToSend = this.mapToPersistentKeys(this.toObject());
            
            let response;
            if (this.isNew()) {
                response = await Application.axiosInstance.post(endpoint!, dataToSend);
            } else {
                const uniqueKey = this.getUniquePropertyValue();
                response = await Application.axiosInstance.put(`${endpoint}/${uniqueKey}`, dataToSend);
            }
            
            const mappedData = this.mapFromPersistentKeys(response.data);
            Object.assign(this, mappedData);
            this._originalState = structuredClone(this.toObject());
            this._isSaving = false;
            this.afterSave();
            Application.ApplicationUIService.hideLoadingMenu();
            Application.ApplicationUIService.showToast('Guardado con exito.', ToastType.SUCCESS);
            return this;
        } catch (error: any) {
            this._isSaving = false;
            Application.ApplicationUIService.hideLoadingMenu();
            this.saveFailed();
            Application.ApplicationUIService.openConfirmationMenu(
                confMenuType.ERROR,
                'Error al guardar',
                error.response?.data?.message || error.message || 'Error desconocido',
                undefined,
                'Aceptar',
                'Cerrar'
            );
            throw error;
        }
    }
 
    public async update(): Promise<this> {
        if (!this.validatePersistenceConfiguration()) {
            return this;
        }
        
        if (!this.validateApiMethod('PUT')) {
            return this;
        }
        
        if (this.isNew()) {
            Application.ApplicationUIService.openConfirmationMenu(
                confMenuType.ERROR,
                'Error al actualizar',
                'No se puede actualizar un elemento que no ha sido guardado',
                undefined,
                'Aceptar',
                'Cerrar'
            );
            return this;
        }
        
        this._isSaving = true;
        this.beforeUpdate();
        
        try {
            this.onUpdating();
            const endpoint = this.getApiEndpoint();
            const uniqueKey = this.getUniquePropertyValue();
            const dataToSend = this.mapToPersistentKeys(this.toObject());
            
            const response = await Application.axiosInstance.put(`${endpoint}/${uniqueKey}`, dataToSend);
            const mappedData = this.mapFromPersistentKeys(response.data);
            Object.assign(this, mappedData);
            this._originalState = structuredClone(this.toObject());
            this._isSaving = false;
            this.afterUpdate();
            return this;
        } catch (error: any) {
            this._isSaving = false;
            this.updateFailed();
            Application.ApplicationUIService.openConfirmationMenu(
                confMenuType.ERROR,
                'Error al actualizar',
                error.response?.data?.message || error.message || 'Error desconocido',
                undefined,
                'Aceptar',
                'Cerrar'
            );
            throw error;
        }
    }

    public async delete(): Promise<void> {
        if (!this.validatePersistenceConfiguration()) {
            return;
        }
        
        if (!this.validateApiMethod('DELETE')) {
            return;
        }
        
        if (this.isNew()) {
            Application.ApplicationUIService.openConfirmationMenu(
                confMenuType.ERROR,
                'Error al eliminar',
                'No se puede eliminar un elemento que no ha sido guardado',
                undefined,
                'Aceptar',
                'Cerrar'
            );
            return;
        }
        
        this.beforeDelete();
        
        try {
            this.onDeleting();
            const endpoint = this.getApiEndpoint();
            const uniqueKey = this.getUniquePropertyValue();
            
            await Application.axiosInstance.delete(`${endpoint}/${uniqueKey}`);
            this.afterDelete();
        } catch (error: any) {
            this.deleteFailed();
            Application.ApplicationUIService.openConfirmationMenu(
                confMenuType.ERROR,
                'Error al eliminar',
                error.response?.data?.message || error.message || 'Error desconocido',
                undefined,
                'Aceptar',
                'Cerrar'
            );
            throw error;
        }
    }

    public async refresh(filter: string = ''): Promise<this[]> {
        try {
            const instances = await (this.constructor as any).getElementList(filter);
            this.afterRefresh();
            return instances;
        } catch (error) {
            this.refreshFailed();
            throw error;
        }
    }

    public onBeforeRouteLeave() : boolean {
        return true;
    }

    public getDirtyState(): boolean {
        var snapshotJson = JSON.stringify(this._originalState);
        var actualJson = JSON.stringify(this.toObject());
        return snapshotJson !== actualJson;
    }

    public resetChanges(): void {
        if (this._originalState) {
            Object.assign(this, structuredClone(this._originalState));
        }
    }

    protected beforeSave() : void {

    }
    protected onSaving() : void {
        
    }
    protected afterSave() : void {
        
    }
    protected saveFailed() : void {
        
    }

    protected beforeUpdate() : void {

    }
    protected onUpdating() : void {
        
    }
    protected afterUpdate() : void {
        
    }
    protected updateFailed() : void {
        
    }

    protected beforeDelete() : void {

    }
    protected onDeleting() : void {

    }
    protected afterDelete() : void {

    }
    protected deleteFailed() : void {

    }

    protected afterGetElement() : void {

    }
    protected getElementFailed() : void {

    }

    protected afterGetElementList() : void {

    }
    protected getElementListFailed() : void {

    }

    protected afterRefresh() : void {

    }
    protected refreshFailed() : void {
        
    }

    public override isPersistent(): this is PersistentEntity {
        return true;
    }
}