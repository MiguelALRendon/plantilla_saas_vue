# plantilla_saas_vue Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-26

## Active Technologies
- TypeScript 5.x (`strict: true`, `experimentalDecorators: true`, `emitDecoratorMetadata: true`) + Vue 3.x (Composition API) + Vue 3, Vite (build), Axios (HTTP), Vue Router, mitt (EventBus) (001-framework-saas-spec)
- LocalStorage (via `@Persistent` decorator) + REST API via Axios (001-framework-saas-spec)
- TypeScript 5.x (strict) + Vue 3 (Composition API) + Vue 3, Vite, Vue Router, Axios, mitt (phase-01-core-stabilization)
- REST API persistence + browser LocalStorage where decorators enable persistence (phase-01-core-stabilization)
- TypeScript 5.x + Vue 3.3+ (Composition API) + Vue 3, Vue Router, Pinia (stores), Axios, mitt (EventBus), TypeScript Decorators (experimentalDecorators) (001-user-auth)
- SessionStorage (user data + authentication tokens), no database on frontend (001-user-auth)

- [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION] + [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION] (001-framework-saas-spec)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

cd src; pytest; ruff check .

## Code Style

[e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]: Follow standard conventions

## Recent Changes
- 001-user-auth: Added TypeScript 5.x + Vue 3.3+ (Composition API) + Vue 3, Vue Router, Pinia (stores), Axios, mitt (EventBus), TypeScript Decorators (experimentalDecorators)
- phase-01-core-stabilization: Added TypeScript 5.x (strict) + Vue 3 (Composition API) + Vue 3, Vite, Vue Router, Axios, mitt
- 001-framework-saas-spec: Added TypeScript 5.x (`strict: true`, `experimentalDecorators: true`, `emitDecoratorMetadata: true`) + Vue 3.x (Composition API) + Vue 3, Vite (build), Axios (HTTP), Vue Router, mitt (EventBus)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
