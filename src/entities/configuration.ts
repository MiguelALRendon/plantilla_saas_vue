import {
    DefaultProperty,
    Module,
    OnViewFunction,
    PropertyIndex,
    PropertyName,
} from '@/decorations';
import { Language } from '@/enums/language';
import { ToastType } from '@/enums/toast_type';
import { ViewTypes } from '@/enums/view_type';
import { GetLanguagedText } from '@/helpers/language_helper';
import Application from '@/models/application';
import type { AppConfiguration } from '@/models/app_configuration';

import { BaseEntity } from './base_entity';

@DefaultProperty('appName')
@Module({ name: 'common.configuration', persistent: false })
export class Configuration extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('common.framework.configuration.fields.app_name', String)
    appName!: string;

    @PropertyIndex(2)
    @PropertyName('common.framework.configuration.fields.app_version', String)
    appVersion!: string;

    @PropertyIndex(3)
    @PropertyName('common.framework.configuration.fields.squared_app_logo_image', String)
    squared_app_logo_image!: string;

    @PropertyIndex(4)
    @PropertyName('common.framework.configuration.fields.api_base_url', String)
    apiBaseUrl!: string;

    @PropertyIndex(5)
    @PropertyName('common.framework.configuration.fields.api_timeout', Number)
    apiTimeout!: number;

    @PropertyIndex(6)
    @PropertyName('common.framework.configuration.fields.api_retry_attempts', Number)
    apiRetryAttempts!: number;

    @PropertyIndex(7)
    @PropertyName('common.framework.configuration.fields.environment', String)
    environment!: string;

    @PropertyIndex(8)
    @PropertyName('common.framework.configuration.fields.log_level', String)
    logLevel!: string;

    @PropertyIndex(9)
    @PropertyName('common.framework.configuration.fields.auth_token_key', String)
    authTokenKey!: string;

    @PropertyIndex(10)
    @PropertyName('common.framework.configuration.fields.auth_refresh_token_key', String)
    authRefreshTokenKey!: string;

    @PropertyIndex(11)
    @PropertyName('common.framework.configuration.fields.session_timeout', Number)
    sessionTimeout!: number;

    @PropertyIndex(12)
    @PropertyName('common.framework.configuration.fields.items_per_page', Number)
    itemsPerPage!: number;

    @PropertyIndex(13)
    @PropertyName('common.framework.configuration.fields.max_file_size', Number)
    maxFileSize!: number;

    @PropertyIndex(14)
    @PropertyName('common.framework.configuration.fields.dark_mode', Boolean)
    isDarkMode!: boolean;

    @PropertyIndex(15)
    @PropertyName('common.framework.configuration.fields.selected_language', Language)
    selectedLanguage!: Language;

    @OnViewFunction('SAVE', 'common.save', [ViewTypes.DETAILVIEW])
    public guardar(): void {
        const normalized = this.toAppConfiguration();
        Application.applyConfigurationSnapshot(normalized);
        this._originalState = this.toPersistentObject();
        Application.ApplicationUIService.showToast(GetLanguagedText('common.saved_successfully'), ToastType.SUCCESS);
    }

    public toAppConfiguration(): AppConfiguration {
        return {
            appName: String(this.appName ?? ''),
            appVersion: String(this.appVersion ?? ''),
            squared_app_logo_image: String(this.squared_app_logo_image ?? ''),
            apiBaseUrl: String(this.apiBaseUrl ?? ''),
            apiTimeout: Number(this.apiTimeout ?? 0),
            apiRetryAttempts: Number(this.apiRetryAttempts ?? 0),
            environment: String(this.environment ?? 'development'),
            logLevel: String(this.logLevel ?? 'info'),
            authTokenKey: String(this.authTokenKey ?? 'auth_token'),
            authRefreshTokenKey: String(this.authRefreshTokenKey ?? 'refresh_token'),
            sessionTimeout: Number(this.sessionTimeout ?? 0),
            itemsPerPage: Number(this.itemsPerPage ?? 20),
            maxFileSize: Number(this.maxFileSize ?? 0),
            isDarkMode: Boolean(this.isDarkMode),
            selectedLanguage: Number(this.selectedLanguage ?? Language.EN) as Language,
            asyncValidationDebounce: Number(import.meta.env.VITE_ASYNC_VALIDATION_DEBOUNCE) || 300,
        };
    }

    public static fromAppConfiguration(config: AppConfiguration): Configuration {
        return new Configuration({
            ...config,
            selectedLanguage: Number(config.selectedLanguage) as Language,
        });
    }
}
