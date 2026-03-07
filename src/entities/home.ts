import { Module, NotRequiresLogin } from '@/decorations';

import { BaseEntity } from './base_entity';
import ICONS from '@/constants/icons';

@Module({ name: 'common.home', icon: ICONS.HOME, persistent: false })
@NotRequiresLogin()
export class Home extends BaseEntity {
    // Intentionally empty base home module; can be extended/overridden by applications.
}
