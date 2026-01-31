import { Disabled, HideInDetailView, HideInListView, PropertyName, UniquePropertyKey } from "@/decorations";
import { BaseEntity } from "./base_entitiy";

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

    public isNew(): boolean {
        return this.getPrimaryPropertyValue() === undefined || this.getPrimaryPropertyValue() === null;
    }

    public getElement(oid : string): BaseEntity {
        return null as unknown as BaseEntity;
    }

    public getElementList(filter : string): BaseEntity[] {
        return [];
    }

    public save(): Promise<this> {
        this._isSaving = true;
        return Promise.resolve(this);
    }
 
    public update(): Promise<this> {
        return Promise.resolve(this);
    }

    public delete(): Promise<void> {
        return Promise.resolve();
    }

    public refresh(filter : string): BaseEntity[] {
        return [];
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
}