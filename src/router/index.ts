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
            /** Redirect to first module if it exists */
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

/**
 * Navigation guard to synchronize Application state with URL changes
 * Executes before each route navigation to update Application.View based on URL parameters
 * Prevents infinite loops by comparing current state before updating
 */
router.beforeEach(async (to, _from, next) => {
    const moduleName = to.params.module as string;
    const entityObjectId = to.params.oid as string;

    /** Find the corresponding module class from ModuleList by name matching */
    const moduleClass = Application.ModuleList.value.find((mod: typeof BaseEntity) => {
        const modName = mod.getModuleName() || mod.name;
        return modName.toLowerCase() === moduleName?.toLowerCase();
    });

    if (moduleClass) {
        const concreteModuleClass = moduleClass as typeof BaseEntity & (new (data: Record<string, unknown>) => BaseEntity);

        /**
         * Detect if navigation comes from direct URL change (not from Application)
         * Compare current Application state with URL params to determine if update needed
         */
        const currentModule = Application.View.value.entityClass;
        const currentModuleName = currentModule
            ? (currentModule.getModuleName() || currentModule.name).toLowerCase()
            : '';
        const currentEntityId = Application.View.value.entityOid;

        /** Only update Application if URL is different from current state to prevent loops */
        if (currentModuleName !== moduleName.toLowerCase() || currentEntityId !== (entityObjectId || '')) {
            if (entityObjectId && to.meta.viewType === 'detail') {
                /** Detail view - Handle entity creation or editing */
                if (entityObjectId === 'new') {
                    const newEntity: BaseEntity = concreteModuleClass.createNewInstance();
                    Application.View.value.entityClass = moduleClass;
                    Application.View.value.entityObject = newEntity;
                    Application.View.value.component = moduleClass.getModuleDetailComponent();
                    Application.View.value.viewType = ViewTypes.DETAILVIEW;
                    Application.View.value.entityOid = entityObjectId;
                    Application.setButtonList();
                } else {
                    try {
                        const loadedEntity: BaseEntity = await concreteModuleClass.getElement(entityObjectId);
                        Application.View.value.entityClass = moduleClass;
                        Application.View.value.entityObject = loadedEntity;
                        Application.View.value.component = moduleClass.getModuleDetailComponent();
                        Application.View.value.viewType = ViewTypes.DETAILVIEW;
                        Application.View.value.entityOid = entityObjectId;
                        Application.setButtonList();
                    } catch (error: unknown) {
                        console.error('[Router] Failed to load entity with ID:', entityObjectId, error);
                        next(false);
                        return;
                    }
                }
            } else {
                /** List view - Display table of entities */
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
        /** Module not found - Log warning and prevent navigation */
        console.warn('[Router] Module not found:', moduleName);
        next(false);
    }
});

/**
 * After-navigation guard for logging successful navigations
 * Logs path and entityOid for debugging synchronization
 */
router.afterEach((to) => {
    console.log('[Router] Navigated to:', to.path, '| entityOid:', Application.View.value.entityOid);
});

export default router;

/**
 * Legacy function kept for backwards compatibility
 * No longer performs any initialization as Application is imported directly
 */
export function initializeRouterWithApplication(): void {
    /** No-op - Application imported directly at module level */
}
