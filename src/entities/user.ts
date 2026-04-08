import {
    DefaultProperty,
    HideInDetailView,
    HideInListView,
    Module,
    NotRequiresLogin,
    PrimaryProperty,
    PropertyIndex,
    PropertyName,
    Required,
    StringTypeDef,
    UniquePropertyKey,
} from '@/decorations';
import { StringType } from '@/enums/string_type';
import { GetLanguagedText } from '@/helpers/language_helper';
import Application from '@/models/application';
import { ToastType } from '@/enums/toast_type';
import ICONS from '@/constants/icons';

import { BaseEntity } from './base_entity';

@Module({
    name: 'common.auth.login',
    icon: ICONS.AVATAR,
    apiEndpoint: '/auth/login',
    apiMethods: ['POST'],
})
@NotRequiresLogin()
@PrimaryProperty('oid')
@UniquePropertyKey('oid')
@DefaultProperty('usuario')
export class User extends BaseEntity {
    // #region PROPERTIES

    @PropertyIndex(1)
    @PropertyName('common.auth.username', String)
    @Required(true)
    @HideInListView()
    usuario: string = '';

    @PropertyIndex(2)
    @PropertyName('common.auth.password', String)
    @StringTypeDef(StringType.PASSWORD)
    @Required(true)
    @HideInListView()
    @HideInDetailView()
    contraseña: string = '';

    // Fields populated from API response — no @PropertyName so they are
    // excluded from the POST request payload (toPersistentObject only includes
    // properties with @PropertyName metadata).
    oid?: string;
    fkSistema?: string;
    fkEmpleado?: string;
    sistema?: Record<string, unknown>;
    empleado?: Record<string, unknown>;
    createdAt?: string;
    updatedAt?: string;
    creado_por?: string;
    editado_por?: string;
    estatus?: string;

    // Tokens set directly by Object.assign from API response
    access_token?: string;
    refresh_token?: string;

    // #endregion

    // #region LIFECYCLE HOOKS

    /**
     * Called after POST /auth/login succeeds and response data is assigned to entity.
     * At this point:
     *   - this.usuario  = the nested user object from API response  (overwritten by Object.assign)
     *   - this.access_token  = JWT access token
     *   - this.refresh_token = JWT refresh token
     */
    override afterSave(): void {
        // Extract nested user data (API response assigns the "usuario" object to this.usuario)
        const userData = this.usuario as unknown as Record<string, unknown>;

        // Clear password from memory immediately
        this.contraseña = '';

        // Persist session via Application
        Application.SaveUserData(userData, this.access_token ?? '', this.refresh_token ?? '');

        // Show success feedback and navigate to the home page
        Application.ApplicationUIService.showToast(
            GetLanguagedText('common.auth.login_success'),
            ToastType.SUCCESS
        );
        Application.router?.push('/home').catch(() => {});
    }

    // #endregion
}
