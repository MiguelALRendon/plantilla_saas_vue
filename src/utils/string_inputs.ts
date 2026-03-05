export function sanitizeDigits(value: string, maxLength: number): string {
    return value.replace(/\D/g, '').slice(0, maxLength);
}

export function formatPhone(value: string, length: number): string {
    const digits = sanitizeDigits(value, length);

    if (length === 10) {
        const first = digits.slice(0, 3);
        const second = digits.slice(3, 6);
        const third = digits.slice(6, 10);
        return [first, second, third].filter(Boolean).join(' ');
    }

    const chunks = digits.match(/.{1,3}/g);
    return chunks ? chunks.join(' ') : '';
}

export function formatCreditCard(value: string): string {
    const digits = sanitizeDigits(value, 16);
    const chunks = digits.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : '';
}

export function formatCreditCardDate(value: string): string {
    const digits = sanitizeDigits(value, 4);
    const month = digits.slice(0, 2);
    const year = digits.slice(2, 4);
    return year ? `${month}/${year}` : month;
}

export function formatCreditCardCvv(value: string): string {
    return sanitizeDigits(value, 3);
}

export function isValidHttpUrl(value: string): boolean {
    return /^https?:\/\/\S+$/i.test(value);
}

export function isValidCreditCardDate(value: string): boolean {
    const match = /^(\d{2})\/(\d{2})$/.exec(value);
    if (!match) {
        return false;
    }

    const month = Number(match[1]);
    const year = Number(match[2]);

    return month >= 1 && month <= 12 && year >= 1 && year <= 99;
}
