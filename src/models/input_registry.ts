import type { Component } from 'vue';

import BooleanInputComponent from '@/components/Form/BooleanInputComponent.vue';
import CreditCardCvvInputComponent from '@/components/Form/CreditCardCvvInputComponent.vue';
import CreditCardDateInputComponent from '@/components/Form/CreditCardDateInputComponent.vue';
import CreditCardInputComponent from '@/components/Form/CreditCardInputComponent.vue';
import DateInputComponent from '@/components/Form/DateInputComponent.vue';
import HourInputComponent from '@/components/Form/HourInputComponent.vue';
import DateTimeInputComponent from '@/components/Form/DateTimeInputComponent.vue';
import ColorInputComponent from '@/components/Form/ColorInputComponent.vue';
import FileUploadInputComponent from '@/components/Form/FileUploadInputComponent.vue';
import TagInputComponent from '@/components/Form/TagInputComponent.vue';
import EmailInputComponent from '@/components/Form/EmailInputComponent.vue';
import EnumInputComponent from '@/components/Form/EnumInputComponent.vue';
import NumberInputComponent from '@/components/Form/NumberInputComponent.vue';
import ObjectInputComponent from '@/components/Form/ObjectInputComponent.vue';
import PasswordInputComponent from '@/components/Form/PasswordInputComponent.vue';
import SearchInputComponent from '@/components/Form/SearchInputComponent.vue';
import TelephoneInputComponent from '@/components/Form/TelephoneInputComponent.vue';
import TextAreaComponent from '@/components/Form/TextAreaComponent.vue';
import TextInputComponent from '@/components/Form/TextInputComponent.vue';
import UrlImageInputComponent from '@/components/Form/UrlImageInputComponent.vue';
import UrlInputComponent from '@/components/Form/UrlInputComponent.vue';
import { StringType } from '@/enums/string_type';

/**
 * Sentinel symbol used as the propType key for BaseEntity subclass properties.
 * Registered in InputRegistry so ObjectInputComponent can be resolved independently
 * of the concrete entity class.
 */
export const OBJECT_TYPE_SENTINEL = Symbol('__object_input__');

/**
 * Sentinel symbol used as the propType key for enum properties (EnumAdapter instances).
 */
export const ENUM_TYPE_SENTINEL = Symbol('__enum_input__');

type RegistryKey = Function | symbol;

interface RegistryEntry {
    propTypeKey: RegistryKey;
    stringType: StringType | null;
    component: Component;
}

/**
 * T123 — InputRegistry maps (propType, stringType?) → input Component.
 * Use `register()` to add new input type mappings.
 * Use `resolve()` to get the Component for a given prop type.
 */
export class InputRegistry {
    private entries: RegistryEntry[] = [];

    register(propTypeKey: RegistryKey, stringType: StringType | null, component: Component): void {
        this.entries.push({ propTypeKey, stringType, component });
    }

    resolve(propTypeKey: RegistryKey, stringType: StringType | null): Component | null {
        return (
            this.entries.find(
                (e) => e.propTypeKey === propTypeKey && e.stringType === stringType
            )?.component ?? null
        );
    }
}

/**
 * T124 — Singleton InputRegistry with all 16 input component mappings pre-registered.
 * Import this instance wherever input resolution is needed.
 */
export const inputRegistry = new InputRegistry();

// Non-string / non-enum types
inputRegistry.register(Number, null, NumberInputComponent);
inputRegistry.register(Date, null, DateInputComponent);
inputRegistry.register(Boolean, null, BooleanInputComponent);
inputRegistry.register(OBJECT_TYPE_SENTINEL, null, ObjectInputComponent);
inputRegistry.register(ENUM_TYPE_SENTINEL, null, EnumInputComponent);

// String subtypes keyed by StringType
inputRegistry.register(String, StringType.TEXT, TextInputComponent);
inputRegistry.register(String, StringType.TEXTAREA, TextAreaComponent);
inputRegistry.register(String, StringType.EMAIL, EmailInputComponent);
inputRegistry.register(String, StringType.PASSWORD, PasswordInputComponent);
inputRegistry.register(String, StringType.TELEPHONE, TelephoneInputComponent);
inputRegistry.register(String, StringType.URL, UrlInputComponent);
inputRegistry.register(String, StringType.URL_IMAGE, UrlImageInputComponent);
inputRegistry.register(String, StringType.SEARCH, SearchInputComponent);
inputRegistry.register(String, StringType.CREDIT_CARD, CreditCardInputComponent);
inputRegistry.register(String, StringType.CREDIT_CARD_DATE, CreditCardDateInputComponent);
inputRegistry.register(String, StringType.CREDIT_CARD_CVV, CreditCardCvvInputComponent);
inputRegistry.register(String, StringType.DATE, DateInputComponent);
inputRegistry.register(String, StringType.TIME, HourInputComponent);
inputRegistry.register(String, StringType.DATETIME, DateTimeInputComponent);
inputRegistry.register(String, StringType.COLOR, ColorInputComponent);
inputRegistry.register(String, StringType.FILE, FileUploadInputComponent);
inputRegistry.register(String, StringType.TAGS, TagInputComponent);
