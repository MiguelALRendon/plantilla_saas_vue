import { MaskSides } from '@/enums/mask_sides';

function normalizeMaskInput(value: string): string {
    return value.replace(/[^a-zA-Z0-9]/g, '');
}

export function applyMask(value: string, mask: string, side: MaskSides): string {
    const normalizedValue = normalizeMaskInput(value);

    if (!mask || normalizedValue.length === 0) {
        return normalizedValue;
    }

    if (side === MaskSides.END) {
        let inputIndex = normalizedValue.length - 1;
        const output: string[] = [];

        for (let maskIndex = mask.length - 1; maskIndex >= 0; maskIndex--) {
            const maskChar = mask[maskIndex];

            if (maskChar === '#') {
                if (inputIndex < 0) {
                    break;
                }

                output.unshift(normalizedValue[inputIndex]);
                inputIndex -= 1;
                continue;
            }

            if (output.length > 0 && inputIndex >= -1) {
                output.unshift(maskChar);
            }
        }

        return output.join('');
    }

    let inputIndex = 0;
    let output = '';

    for (const maskChar of mask) {
        if (maskChar === '#') {
            if (inputIndex >= normalizedValue.length) {
                break;
            }

            output += normalizedValue[inputIndex];
            inputIndex += 1;
            continue;
        }

        if (inputIndex > 0 && inputIndex <= normalizedValue.length) {
            output += maskChar;
        }
    }

    return output;
}
