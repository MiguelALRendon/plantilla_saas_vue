import { BaseEntity } from "./base_entitiy";

export abstract class PersistentEntity extends BaseEntity {
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
        return Promise.resolve(this);
    }

    public update(): Promise<this> {
        return Promise.resolve(this);
    }

    public delete(): Promise<void> {
        return Promise.resolve();
    }
}