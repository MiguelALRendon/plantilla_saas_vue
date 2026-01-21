export class EnumAdapter {
    private enumRef: any;

    constructor(enumRef: any) {
        this.enumRef = enumRef;
    }

    getKeyValuePairs(): { key: string; value: number }[] {
        return Object.keys(this.enumRef)
            .filter(key => isNaN(Number(key)))
            .map(key => ({
                key: key,
                value: this.enumRef[key]
            }));
    }
}
