---
description: "Task list for User Authentication System implementation"
feature: "001-user-auth"
generated: "2026-04-06"
---

# Tasks: User Authentication System

**Input**: Design documents from `/specs/001-user-auth/`  
**Prerequisites**: ✅ plan.md, ✅ spec.md, ✅ research.md, ✅ data-model.md, ✅ contracts/, ✅ quickstart.md

**Tests**: Tests are NOT included (not requested in spec)

**Organization**: Tasks grouped by user story for independent implementation and testing

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3, US4)
- File paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Status**: ✅ Complete (project already initialized)

No tasks - project structure already exists from framework setup.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure required before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T001 [P] Add i18n authentication keys to src/languages/common.json (auth.username, auth.password, auth.login, auth.logout, auth.login_success, auth.logout_success) - verify no duplicates exist
- [X] T002 [P] Add i18n error keys to src/languages/errors.json (authentication_failed, invalid_credentials) with EN/ES/JP translations
- [X] T003 Create User entity in src/entities/user.ts with @Module, @PropertyName, @Required, @StringTypeDef decorators and properties: usuario, contraseña, oid, fkSistema, fkEmpleado, sistema, empleado, createdAt, updatedAt, creado_por, editado_por, estatus
- [X] T004 [P] Add LOGIN icon constant to src/constants/icons.ts if not already present

**Checkpoint**: Foundation ready - User entity defined, i18n keys configured

---

## Phase 3: User Story 1 - User Login Flow (Priority: P1) 🎯 MVP

**Goal**: Enable users to authenticate with credentials and access the application

**Independent Test**: Navigate to application without authentication, enter valid credentials (usuario: "test_user", contraseña: "password123"), submit form, verify redirect to /home route with user data stored in SessionStorage

### Implementation for User Story 1

- [X] T005 [US1] Create LoginView.vue in src/views/ with form containing usuario and contraseña inputs bound to User entity instance, handleLogin submit function, loading state, and error display
- [X] T006 [US1] Implement User.onSaved() lifecycle hook in src/entities/user.ts to: (1) clear contraseña field, (2) extract access_token and refresh_token from response, (3) call Application.SaveUserData(), (4) redirect to /home route, (5) show success toast
- [X] T007 [US1] Implement Application.SaveUserData(user, access_token, refresh_token) method in src/models/application.ts to serialize user object (excluding contraseña) and store in SessionStorage with key 'current_user', store tokens using AppConfiguration.authTokenKey and authRefreshTokenKey
- [X] T008 [US1] Add /login route to src/router/index.ts with component: LoginView, path: '/login', name: 'Login', meta: { requiresAuth: false }

**Checkpoint**: User Story 1 complete - Users can log in successfully, tokens stored, redirected to /home

---

## Phase 4: User Story 2 - Authentication Guard (Priority: P1)

**Goal**: Protect all routes and automatically redirect unauthenticated users to login screen

**Independent Test**: Clear SessionStorage using browser DevTools, attempt to navigate to any protected route (e.g., /home), verify automatic redirect to /login view

### Implementation for User Story 2

- [X] T009 [US2] Implement Application.CurrentUser() method in src/models/application.ts to retrieve 'current_user' from SessionStorage, parse JSON, instantiate User entity with data, return null if SessionStorage empty or invalid
- [X] T010 [US2] Add router.beforeEach() navigation guard in src/router/index.ts to: (1) check if route requires auth (meta.requiresAuth !== false), (2) call Application.CurrentUser(), (3) redirect to /login if not authenticated and route requires auth, (4) allow navigation if authenticated or route is public
- [X] T011 [US2] Add authentication check in src/App.vue onMounted lifecycle hook to call Application.CurrentUser() and redirect to /login if returns null and current route is not /login

**Checkpoint**: User Story 2 complete - All protected routes guarded, unauthenticated users auto-redirected to login

---

## Phase 5: User Story 3 - Multi-language Login Interface (Priority: P2)

**Goal**: Display all login text in user's selected language

**Independent Test**: Change language setting in application (Application.AppConfiguration.selectedLanguage), navigate to /login, verify all labels, buttons, and error messages display in selected language

### Implementation for User Story 3

**Status**: ✅ Already complete from Phase 2 (Foundational)

No additional tasks - i18n keys added in T001 and T002 are automatically used by LoginView.vue via GetLanguagedText() helper

**Checkpoint**: User Story 3 complete - Login interface displays in all supported languages (EN/ES/JP)

---

## Phase 6: User Story 4 - User Data Management and Logout (Priority: P2)

**Goal**: Provide centralized user state management and logout functionality

**Independent Test**: 
1. Login successfully, open browser console, run `Application.CurrentUser()`, verify returns User entity with correct data
2. Click configuration dropdown in TopBar, verify "Cerrar Sesión" button visible below configuration button
3. Click logout button, verify SessionStorage cleared (run `sessionStorage.getItem('current_user')` returns null), verify redirect to /login

### Implementation for User Story 4

- [X] T012 [US4] Implement Application.Logout() method in src/models/application.ts to: (1) clear 'current_user' from SessionStorage, (2) clear tokens using AppConfiguration.authTokenKey and authRefreshTokenKey, (3) set CurrentUser to null, (4) redirect to /login route, (5) show logout success toast
- [X] T013 [US4] Add logout button to src/components/TopBarComponent.vue in configuration dropdown menu positioned below configuration button with label GetLanguagedText('common.auth.logout'), click handler calls Application.Logout()

**Checkpoint**: User Story 4 complete - CurrentUser() retrieves user state, Logout() clears session and redirects

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validation, documentation, and final improvements

- [ ] T014 Verify implementation against specs/001-user-auth/quickstart.md 8-step guide (environment config, User entity structure, i18n keys present, LoginView layout, Application methods signatures, router guards logic, TopBar button placement, App.vue auth check)
- [ ] T015 [P] Test User Story 1 independently: Fresh browser → navigate to app → see login form → enter valid credentials → verify redirect to /home → verify SessionStorage contains user data and tokens
- [ ] T016 [P] Test User Story 2 independently: Clear SessionStorage → attempt direct navigation to /home → verify redirect to /login → login successfully → verify access granted
- [ ] T017 [P] Test User Story 3 independently: Change language to Spanish → verify login labels in Spanish → change to Japanese → verify login labels in Japanese → change to English → verify login labels in English
- [ ] T018 [P] Test User Story 4 independently: Login → call Application.CurrentUser() in console → verify User entity returned → click logout button → verify SessionStorage cleared → verify redirect to /login
- [ ] T019 Test edge cases: (1) Invalid credentials → verify error toast, (2) Backend unreachable → verify network error toast, (3) SessionStorage disabled → verify error message, (4) Refresh page after login → verify session persists
- [ ] T020 [P] Add authentication example to copilot/examples/authentication-example.md documenting User entity pattern, lifecycle hooks usage, and Application auth methods

**Checkpoint**: All user stories validated independently, edge cases tested, documentation updated

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Setup (Phase 1)**: ✅ Complete - No dependencies
2. **Foundational (Phase 2)**: Depends on Setup - **BLOCKS all user stories**
3. **User Stories (Phases 3-6)**: All depend on Foundational completion
   - Can proceed in parallel if staffed
   - Or sequentially in priority order: US1 (P1) → US2 (P1) → US3 (P2) → US4 (P2)
4. **Polish (Phase 7)**: Depends on all desired user stories complete

### User Story Dependencies

- **US1 (P1) - Login Flow**: Depends on Phase 2 (Foundational) - No dependencies on other stories
- **US2 (P1) - Auth Guard**: Depends on Phase 2 (Foundational) + T009 (Application.CurrentUser) for checking auth state
- **US3 (P2) - Multi-language**: ✅ Automatically complete from Phase 2 i18n keys
- **US4 (P2) - Logout**: Depends on Phase 2 (Foundational) + ability to test requires US1 complete (need login to logout)

### Within Each User Story

**US1 Tasks Order:**
1. T005 (LoginView.vue) - Can create anytime, but needs User entity from T003
2. T006 (User.onSaved) - Needs T007 (SaveUserData) defined to call it
3. T007 (SaveUserData) - Independent, can do early
4. T008 (/login route) - Independent, can do early

**US2 Tasks Order:**
1. T009 (CurrentUser) - Independent, foundational for US2
2. T010 (router guards) - Needs T009 to check if user authenticated
3. T011 (App.vue check) - Needs T009 to check if user authenticated

**US4 Tasks Order:**
1. T012 (Logout) - Independent
2. T013 (TopBar button) - Needs T012 to call logout method

### Parallel Opportunities

**Phase 2 (Foundational):**
```bash
# Can run in parallel:
T001 (common.json i18n) || T002 (errors.json i18n) || T004 (LOGIN icon)
# Must complete before:
T003 (User entity) - sequential, depends on i18n keys existing
```

**Phase 3 (US1):**
```bash
# After T007 SaveUserData is done:
T005 (LoginView) || T008 (/login route)
# Then:
T006 (User.onSaved) - depends on SaveUserData existing
```

**Phase 4 (US2):**
```bash
# After T009 CurrentUser is done:
T010 (router guards) || T011 (App.vue check)
```

**Phase 6 (US4):**
```bash
# Can run in parallel:
T012 (Logout method) || T013 (TopBar button)
# Technically button needs method, but can stub or implement together
```

**Phase 7 (Polish):**
```bash
# All test tasks can run in parallel:
T015 || T016 || T017 || T018 || T020
# Must complete sequentially:
T014 (quickstart validation) first, then T019 (edge cases), then tests
```

---

## Parallel Example: User Story 1

After Phase 2 complete:

```bash
# Parallel Group 1 - Independent files:
Task T007: "Implement SaveUserData() in src/models/application.ts"
Task T008: "Add /login route in src/router/index.ts"

# Wait for T007 complete, then Parallel Group 2:
Task T005: "Create LoginView.vue in src/views/"
Task T006: "Implement User.onSaved() in src/entities/user.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

**Recommended approach for fastest time-to-value:**

1. ✅ Complete **Phase 2: Foundational** (i18n + User entity) - ~1-2 hours
2. ✅ Complete **Phase 3: US1 - Login Flow** (LoginView + SaveUserData + routing) - ~2-3 hours
3. ✅ Complete **Phase 4: US2 - Auth Guard** (CurrentUser + guards) - ~1-2 hours
4. **STOP and VALIDATE**: Test login flow + auth protection independently
5. **Deploy/Demo MVP**: Core authentication working (login + guards)
6. Continue with Phase 6 (US4 - Logout) if needed - ~1 hour
7. Polish with Phase 7 - ~1-2 hours

**Total MVP Time**: ~6-10 hours (1-2 developer days)

### Incremental Delivery

1. **Foundation Ready** (Phase 2) → Test: User entity instantiates, i18n keys readable
2. **Login Working** (Phase 3) → Test: Can log in, redirect to /home, tokens stored
3. **Routes Protected** (Phase 4) → Test: Cannot access app without login
4. **Logout Working** (Phase 6) → Test: Can log out, session cleared
5. **Fully Polished** (Phase 7) → Test: All edge cases handled, docs complete

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

If 2 developers available:

1. **Both**: Complete Phase 2 together (~1-2 hours)
2. **Developer A**: Phase 3 (US1 - Login Flow) - ~2-3 hours
3. **Developer B**: Phase 4 (US2 - Auth Guard) - ~1-2 hours  
   *(Note: B needs T009 from US2, but can start T010-T011 in parallel with A's work)*
4. **Both**: Phase 6 (US4 - Logout) together - ~1 hour
5. **Both**: Phase 7 (Polish) - split test tasks - ~1 hour

**Total Team Time**: ~4-6 hours (parallelism saves ~40% time)

---

## Progress Tracking

| Phase | Tasks | Estimated Time | Status |
|-------|-------|----------------|--------|
| Phase 1: Setup | 0 | ✅ Complete | N/A |
| Phase 2: Foundational | 4 (T001-T004) | 1-2 hours | ⬜ Not started |
| Phase 3: US1 (P1) | 4 (T005-T008) | 2-3 hours | ⬜ Not started |
| Phase 4: US2 (P1) | 3 (T009-T011) | 1-2 hours | ⬜ Not started |
| Phase 5: US3 (P2) | 0 | ✅ Complete | N/A |
| Phase 6: US4 (P2) | 2 (T012-T013) | 1 hour | ⬜ Not started |
| Phase 7: Polish | 7 (T014-T020) | 1-2 hours | ⬜ Not started |
| **TOTAL** | **20 tasks** | **6-10 hours** | **0% complete** |

---

## Task Checklist Summary

### Phase 2: Foundational (4 tasks)
- [ ] T001 - i18n common.json keys
- [ ] T002 - i18n errors.json keys
- [ ] T003 - User entity
- [ ] T004 - LOGIN icon constant

### Phase 3: US1 - Login Flow (4 tasks)
- [ ] T005 - LoginView.vue
- [ ] T006 - User.onSaved() hook
- [ ] T007 - Application.SaveUserData()
- [ ] T008 - /login route

### Phase 4: US2 - Auth Guard (3 tasks)
- [ ] T009 - Application.CurrentUser()
- [ ] T010 - Router beforeEach guard
- [ ] T011 - App.vue auth check

### Phase 6: US4 - Logout (2 tasks)
- [ ] T012 - Application.Logout()
- [ ] T013 - TopBar logout button

### Phase 7: Polish (7 tasks)
- [ ] T014 - Quickstart validation
- [ ] T015 - Test US1 independently
- [ ] T016 - Test US2 independently
- [ ] T017 - Test US3 independently
- [ ] T018 - Test US4 independently
- [ ] T019 - Test edge cases
- [ ] T020 - Add authentication example doc

---

## Notes

- **[P] tasks**: Different files, no dependencies, can run in parallel
- **[Story] labels**: Map tasks to spec.md user stories for traceability
- **No tests phase**: Tests not explicitly requested in spec, so test tasks are limited to Phase 7 manual validation
- **US3 special case**: Multi-language support automatically works from i18n keys, no separate implementation tasks needed
- **Sequential dependencies**: T006 needs T007, T010-T011 need T009 - respect these when parallelizing
- **Commit strategy**: Commit after each task or logical group (e.g., all Phase 2 together)
- **Stop at checkpoints**: Validate each user story independently before proceeding to next priority
- **Quickstart.md**: Reference guide for implementation details, code examples, and testing procedures
- **Edge cases**: FR-021 requires i18n key verification before creation - already handled in T001 description

---

*Generated by `/speckit.tasks` command - 2026-04-06*
*Based on: spec.md (4 user stories, 21 FRs), plan.md, research.md (7 decisions), data-model.md (User entity), contracts/user-api-contract.md (POST /auth/login), quickstart.md (8-step guide)*
