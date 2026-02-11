# Framework SaaS Vue - Configuración de Proyecto

## 1. Propósito

Proporcionar instrucciones de configuración, instalación y ejecución del Framework SaaS Vue construido sobre Vue 3 y Vite.

## 2. Alcance

Este documento cubre:
- Instalación de dependencias del proyecto
- Configuración del entorno de desarrollo
- Herramientas recomendadas para desarrollo
- Comandos de compilación y ejecución

## 3. Definiciones Clave

**Vue 3:** Framework progresivo de JavaScript para construcción de interfaces de usuario.

**Vite:** Herramienta de construcción y servidor de desarrollo para aplicaciones web modernas.

**Framework SaaS Vue:** Framework meta-programático de generación automática de interfaces CRUD basado en decoradores TypeScript.

## 4. Descripción Técnica

El proyecto utiliza:
- Vue 3 como framework de presentación
- Vite como herramienta de construcción
- TypeScript para tipado estático
- Sistema de metadatos mediante decoradores

## 5. Flujo de Funcionamiento

Flujo de desarrollo:
1. Instalación de dependencias mediante npm
2. Ejecución de servidor de desarrollo con hot-reload
3. Desarrollo de entidades y decoradores
4. Compilación para producción

## 6. Reglas Obligatorias

### 6.1 Entorno de Desarrollo Obligatorio

IDE requerido: Visual Studio Code

Extensiones obligatorias:
- Vue (Official) - Soporte para Vue 3 y TypeScript
- Vetur debe estar deshabilitado para evitar conflictos

### 6.2 Herramientas de Navegador Requeridas

Navegadores Chromium (Chrome, Edge, Brave):
- Vue.js devtools instalado
- Custom Object Formatter habilitado en DevTools

Firefox:
- Vue.js devtools para Firefox instalado
- Custom Object Formatter habilitado en DevTools

### 6.3 Comandos de Proyecto

Instalación de dependencias:
```sh
npm install
```

Ejecución en modo desarrollo:
```sh
npm run dev
```

Construcción para producción:
```sh
npm run build
```

## 7. Prohibiciones

Prohibido:
- Usar Vetur como extensión de VS Code (conflicto con Vue Official)
- Ejecutar proyecto sin DevTools de Vue instaladas
- Omitir instalación de dependencias antes de ejecutar

## 8. Dependencias

Dependencias externas:
- Node.js y npm
- Visual Studio Code
- Navegador web moderno (Chromium o Firefox)

Dependencias de proyecto:
- Definidas en package.json
- Instaladas mediante npm install

## 9. Relaciones

Este documento se relaciona con:
- [copilot/00-CONTRACT.md](copilot/00-CONTRACT.md) - Contrato de desarrollo
- [copilot/03-QUICK-START.md](copilot/03-QUICK-START.md) - Guía de inicio rápido
- [copilot/README.md](copilot/README.md) - Índice de documentación
- package.json - Configuración de dependencias
- vite.config.js - Configuración de Vite

## 10. Notas de Implementación

### 10.1 Configuración de Vite

Configuración personalizable mediante Vite Configuration Reference:
https://vite.dev/config/

### 10.2 Enlaces de Herramientas

Vue.js DevTools - Chromium:
https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd

Custom Object Formatter - Chrome:
http://bit.ly/object-formatters

Vue.js DevTools - Firefox:
https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/

Custom Object Formatter - Firefox:
https://fxdx.dev/firefox-devtools-custom-object-formatters/

### 10.3 Extensión VS Code

Vue Official Extension:
https://marketplace.visualstudio.com/items?itemName=Vue.volar

## 11. Referencias Cruzadas

Documentación del framework:
- [copilot/00-CONTRACT.md](copilot/00-CONTRACT.md) - Principios contractuales
- [copilot/01-FRAMEWORK-OVERVIEW.md](copilot/01-FRAMEWORK-OVERVIEW.md) - Visión general
- [copilot/02-FLOW-ARCHITECTURE.md](copilot/02-FLOW-ARCHITECTURE.md) - Arquitectura
- [copilot/03-QUICK-START.md](copilot/03-QUICK-START.md) - Inicio rápido
- [copilot/README.md](copilot/README.md) - Índice completo de documentación
