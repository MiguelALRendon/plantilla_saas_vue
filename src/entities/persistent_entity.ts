export abstract class PersistentEntity extends BaseEntity {
    public isNew(): boolean {
        return this.getPrimaryPropertyValue() === undefined || this.getPrimaryPropertyValue() === null;
    }

    public getElement(): string {

    }

    public getElementList(filter : string): string {

    }

    public save(): Promise<this> {
        
    }

    public update(): Promise<this> {
        
    }

    public delete(): Promise<void> {
        
    }
}