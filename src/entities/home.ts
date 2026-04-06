import { Module, ModuleDefaultComponent, NotRequiresLogin } from '@/decorations';

import { BaseEntity } from './base_entity';
import ICONS from '@/constants/icons';
import HomeView from '@/views/HomeView.vue';

@Module({ name: 'common.home', icon: ICONS.HOME, persistent: false })
@ModuleDefaultComponent(HomeView)
@NotRequiresLogin()
export class Home extends BaseEntity {
    // Intentionally empty base home module; can be extended/overridden by applications.
}
