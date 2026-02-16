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
router.beforeEach((to, _from, next) => {
    const moduleName = to.params.module as string;
    const oid = to.params.oid as string;

    // Find the corresponding module
    const moduleClass = Application.ModuleList.value.find((mod: typeof BaseEntity) => {
        const modName = mod.getModuleName() || mod.name;
        return modName.toLowerCase() === moduleName?.toLowerCase();
    });

    if (moduleClass) {
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
                // Detail view - set entityOid
                Application.View.value.entityOid = oid;

                // If OID is 'new', create a new instance
                if (oid === 'new') {
                    // Usar Reflect.construct para instanciar la clase concreta
                    const newEntity: BaseEntity = Reflect.construct(moduleClass, [{}]);
                    Application.changeViewToDetailView(newEntity);
                } else {
                    // En el futuro aquí se llamará a la API para cargar la entidad
                    // Por ahora, si no hay entityObject o no coincide, mostrar vista sin datos
                    // (el componente puede manejar la carga)
                    console.log('[Router] Preparando detail view para OID:', oid);
                }
            } else {
                // List view
                Application.View.value.entityOid = '';

                // Change to list view if not there already
                if (Application.View.value.viewType !== ViewTypes.LISTVIEW) {
                    Application.changeViewToListView(moduleClass);
                }
            }
        }

        next();
    } else {
        // Module not found
        console.warn('[Router] Module not found:', moduleName);
        next();
    }
});

// Guard after navigation for logging
router.afterEach((to) => {
    console.log('[Router] Navigated to:', to.path, '| entityOid:', Application.View.value.entityOid);
});

export default router;
export function initializeRouterWithApplication(): void {
    // Function kept for backwards compatibility but no longer needed
    // Application is now imported directly
}
