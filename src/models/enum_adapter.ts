export class EnumAdapter {
    private enumRef: Record<string, string | number>;

    constructor(enumRef: Record<string, string | number>) {
        this.enumRef = enumRef;
    }

    getKeyValuePairs(): { key: string; value: number }[] {
        return Object.keys(this.enumRef)
            .filter(key => isNaN(Number(key)))
            .map(key => ({
                key: key,
                value: this.enumRef[key] as number,
            }));
    }
}
