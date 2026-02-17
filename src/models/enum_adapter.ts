/**
 * Adaptador para convertir enums TypeScript numéricos a pares key-value.
 * Filtra reverse mapping duplicado generado por enums numéricos.
 * Usado en ListInputComponent para generar opciones dropdown desde enums.
 * § 06-CODE-STYLING-STANDARDS 6.2.1, 6.6.1
 */
export class EnumAdapter {
    /**
     * @region PROPERTIES
     */
    
    /**
     * Referencia al enum TypeScript pasado al constructor.
     */
    private enumRef: Record<string, string | number>;

    /**
     * @endregion
     */

    /**
     * @region METHODS
     */
    
    /**
     * Constructor que inicializa adaptador con enum específico.
     * @param enumRef Enum TypeScript a convertir (ej: ToastType, ViewTypes).
     */
    constructor(enumRef: Record<string, string | number>) {
        this.enumRef = enumRef;
    }

    /**
     * Retorna array de pares {key, value} filtrando reverse mapping duplicado.
     * Enums numéricos generan runtime {SUCCESS: 0, ERROR: 1, 0: "SUCCESS", 1: "ERROR"}.
     * Este método filtra keys numéricas retornando solo keys string.
     * @returns Array de objetos con key (nombre enum) y value (valor numérico).
     */
    getKeyValuePairs(): { key: string; value: number }[] {
        return Object.keys(this.enumRef)
            .filter((key) => isNaN(Number(key)))
            .map((key) => ({
                key: key,
                value: this.enumRef[key] as number
            }));
    }
    
    /**
     * @endregion
     */
}
