import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import type { Router } from 'vue-router';
import { BaseEntity } from '@/entities/base_entity';
import Application from '@/models/application';
import { ViewTypes } from '@/enums/view_type';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        redirect: () => {
            // Redirect to first module if it exists
            if (Application && Application.ModuleList.value.length > 0) {
                const firstModule = Application.ModuleList.value[0];
                const moduleName = firstModule.getModuleName() || firstModule.name;
                return `/${moduleName.toLowerCase()}`;
            }
            return '/';
        }
    },
    {
        path: '/:module',
        name: 'ModuleList',
        component: { template: '<component-container-component />' },
        meta: { viewType: 'list' }
    },
    {
        path: '/:module/:oid',
        name: 'ModuleDetail',
        component: { template: '<component-container-component />' },
        meta: { viewType: 'detail' }
    }
];

const router: Router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

// Navigation guard to synchronize with Application when URL changes directly
router.beforeEach(async (to, _from, next) => {
    const moduleName = to.params.module as string;
    const oid = to.params.oid as string;

    // Find the corresponding module
    const moduleClass = Application.ModuleList.value.find((mod: typeof BaseEntity) => {
        const modName = mod.getModuleName() || mod.name;
        return modName.toLowerCase() === moduleName?.toLowerCase();
    });

    if (moduleClass) {
        const concreteModuleClass = moduleClass as typeof BaseEntity & (new (data: Record<string, unknown>) => BaseEntity);

        // If navigation comes from direct URL change (not from Application)
        // we need to update Application
        const currentModule = Application.View.value.entityClass;
        const currentModuleName = currentModule
            ? (currentModule.getModuleName() || currentModule.name).toLowerCase()
            : '';
        const currentOid = Application.View.value.entityOid;

        // Only update Application if URL is different from what Application has
        if (currentModuleName !== moduleName.toLowerCase() || currentOid !== (oid || '')) {
            if (oid && to.meta.viewType === 'detail') {
                // Detail view
                if (oid === 'new') {
                    const newEntity: BaseEntity = concreteModuleClass.createNewInstance();
                    Application.View.value.entityClass = moduleClass;
                    Application.View.value.entityObject = newEntity;
                    Application.View.value.component = moduleClass.getModuleDetailComponent();
                    Application.View.value.viewType = ViewTypes.DETAILVIEW;
                    Application.View.value.entityOid = oid;
                    Application.setButtonList();
                } else {
                    try {
                        const loadedEntity: BaseEntity = await concreteModuleClass.getElement(oid);
                        Application.View.value.entityClass = moduleClass;
                        Application.View.value.entityObject = loadedEntity;
                        Application.View.value.component = moduleClass.getModuleDetailComponent();
                        Application.View.value.viewType = ViewTypes.DETAILVIEW;
                        Application.View.value.entityOid = oid;
                        Application.setButtonList();
                    } catch (error: unknown) {
                        console.error('[Router] Failed to load entity for OID:', oid, error);
                        next(false);
                        return;
                    }
                }
            } else {
                // List view
                Application.View.value.entityClass = moduleClass;
                Application.View.value.entityObject = null;
                Application.View.value.component = moduleClass.getModuleListComponent();
                Application.View.value.viewType = ViewTypes.LISTVIEW;
                Application.View.value.entityOid = '';
                Application.setButtonList();
            }
        }

        next();
    } else {
        // Module not found
        console.warn('[Router] Module not found:', moduleName);
        next(false);
    }
});

// Guard after navigation for logging
router.afterEach((to) => {
    console.log('[Router] Navigated to:', to.path, '| entityOid:', Application.View.value.entityOid);
});

export default router;
export function initializeRouterWithApplication(): void {
    // Legacy no-op kept for backwards compatibility
}
