import { ModuleIcon, ModuleName, NotRequiresLogin } from '@/decorations';

import { BaseEntity } from './base_entity';
import ICONS from '@/constants/icons';

@ModuleName('common.home')
@ModuleIcon(ICONS.HOME)
@NotRequiresLogin()
export class Home extends BaseEntity {
    // Intentionally empty base home module; can be extended/overridden by applications.
}
