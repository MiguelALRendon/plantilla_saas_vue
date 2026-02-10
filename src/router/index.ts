import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import type { Router } from 'vue-router';
import { BaseEntity } from '@/entities/base_entitiy';

// Se importará dinámicamente desde Application
let Application: any = null;

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        redirect: () => {
            // Redirigir al primer módulo si existe
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

// Función para inicializar Application después de crear el router
export function initializeRouterWithApplication(app: any) {
    Application = app;
}

// Guard de navegación para sincronizar con Application cuando la URL cambia directamente
router.beforeEach((to, _from, next) => {
    if (!Application) {
        next();
        return;
    }

    const moduleName = to.params.module as string;
    const oid = to.params.oid as string;

    // Buscar el módulo correspondiente
    const moduleClass = Application.ModuleList.value.find((mod: typeof BaseEntity) => {
        const modName = mod.getModuleName() || mod.name;
        return modName.toLowerCase() === moduleName?.toLowerCase();
    });

    if (moduleClass) {
        // Si la navegación viene de cambiar la URL directamente (no desde Application)
        // necesitamos actualizar Application
        const currentModule = Application.View.value.entityClass;
        const currentModuleName = currentModule ? (currentModule.getModuleName() || currentModule.name).toLowerCase() : '';
        const currentOid = Application.View.value.entityOid;
        
        // Solo actualizar Application si la URL es diferente de lo que Application tiene
        if (currentModuleName !== moduleName.toLowerCase() || currentOid !== (oid || '')) {
            if (oid && to.meta.viewType === 'detail') {
                // Vista de detalle - setear entityOid
                Application.View.value.entityOid = oid;
                
                // Si el OID es 'new', crear una nueva instancia
                if (oid === 'new') {
                    const newEntity = moduleClass.createNewInstance();
                    Application.changeViewToDetailView(newEntity);
                } else {
                    // En el futuro aquí se llamará a la API para cargar la entidad
                    // Por ahora, si no hay entityObject o no coincide, mostrar vista sin datos
                    // (el componente puede manejar la carga)
                    console.log('[Router] Preparando detail view para OID:', oid);
                }
                
            } else {
                // Vista de lista
                Application.View.value.entityOid = '';
                
                // Cambiar a list view si no estamos ahí
                if (Application.View.value.viewType !== 'LISTVIEW') {
                    Application.changeViewToListView(moduleClass);
                }
            }
        }
        
        next();
    } else {
        // Módulo no encontrado
        console.warn('[Router] Módulo no encontrado:', moduleName);
        next();
    }
});

// Guard después de la navegación para logging
router.afterEach((to) => {
    if (Application) {
        console.log('[Router] Navegado a:', to.path, '| entityOid:', Application.View.value.entityOid);
    }
});

export default router;
