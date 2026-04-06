# Feature Specification: User Authentication System

**Feature Branch**: `001-user-auth`  
**Created**: April 6, 2026  
**Status**: Draft  
**Input**: User description: "Quiero crear una nueva fase con estas tareas: crea LoginView.vue, modifica Application.vue para que controle que si no hay datos de loggeo, te manda automáticamente al login. Sistema de login con API ya creada en auth_service."

## Clarifications

### Session 2026-04-06

- Q: ¿A dónde debe redirigir el sistema después de un login exitoso? → A: A la ruta `/home`
- Q: ¿Cómo se debe manejar el refresh_token devuelto por la API? → A: Se guarda en SessionStorage pero la lógica de refresh automático se marca como deuda técnica para una fase posterior
- Q: ¿Se debe incluir funcionalidad de logout en esta fase? → A: Sí, incluir un botón de "Cerrar Sesión" en el dropdown de configuraciones, debajo del botón de configuraciones

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Login Flow (Priority: P1)

An unauthenticated user visits the application and needs to log in with their credentials to access the system. The system validates their credentials against the backend API and grants access upon successful authentication.

**Why this priority**: This is the core authentication requirement that enables access to the entire application. Without this, no other features can be accessed securely.

**Independent Test**: Can be fully tested by navigating to the application without authentication, entering valid credentials on the login form, and verifying successful redirection to the main application with user data stored in SessionStorage.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user visits the application, **When** they are redirected to the login view, **Then** they see a login form with username and password fields in the current selected language
2. **Given** a user enters valid credentials (username and password), **When** they submit the form, **Then** the system authenticates with the API, clears the password field, stores user data (without password) and tokens in SessionStorage, and redirects to the `/home` route
3. **Given** a user enters invalid credentials, **When** they submit the form, **Then** the system displays an error toast message, marks the input fields as invalid, and remains on the login view
4. **Given** a logged-in user refreshes the page, **When** the application initializes, **Then** the system retrieves user data from SessionStorage, parses it into a User entity, and allows continued access without re-login

---

### User Story 2 - Authentication Guard (Priority: P1)

The application must protect all routes and automatically redirect unauthenticated users to the login screen, ensuring secure access to all features.

**Why this priority**: Critical security requirement that prevents unauthorized access to protected resources and data.

**Independent Test**: Can be fully tested by clearing SessionStorage, attempting to navigate to any protected route, and verifying automatic redirection to login view.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user without SessionStorage data, **When** Application.vue initializes, **Then** the user is automatically redirected to the login view
2. **Given** a logged-in user with valid SessionStorage data, **When** Application.vue initializes, **Then** the user can access the main application without interruption
3. **Given** a logged-in user, **When** they close the browser and reopen, **Then** the system checks SessionStorage and maintains their session or prompts for re-login based on session expiration

---

### User Story 3 - Multi-language Login Interface (Priority: P2)

All login-related text (labels, buttons, error messages, validation feedback) must be displayed in the user's selected language using the i18n system (common.json).

**Why this priority**: Ensures accessibility for international users and maintains consistency with the framework's existing multi-language support.

**Independent Test**: Can be fully tested by changing the language setting in the application configuration and verifying that all login form text, validation messages, and error toasts appear in the selected language.

**Acceptance Scenarios**:

1. **Given** a user with English language selected, **When** they view the login form, **Then** all labels, placeholders, buttons, and messages display in English
2. **Given** a user with Spanish language selected, **When** they view the login form, **Then** all labels, placeholders, buttons, and messages display in Spanish
3. **Given** a user with Japanese language selected, **When** they view the login form, **Then** all labels, placeholders, buttons, and messages display in Japanese
4. **Given** an authentication error occurs, **When** the error toast is displayed, **Then** the error message appears in the currently selected language

---

### User Story 4 - User Data Management and Logout (Priority: P2)

The application must provide centralized functions to save and retrieve current user data, ensuring consistent user state management across the application lifecycle. Additionally, users must be able to log out securely from within the configuration menu.

**Why this priority**: Establishes a clean architecture pattern for user state management that other features can rely on, and provides essential logout capability for security.

**Independent Test**: Can be fully tested by calling SaveUserData() after successful login, CurrentUser() during application initialization, and verifying logout button presence and functionality in the configuration dropdown.

**Acceptance Scenarios**:

1. **Given** successful API authentication response, **When** SaveUserData() is called with the user object, **Then** the user data (without password) and authentication tokens are serialized and stored in SessionStorage
2. **Given** SessionStorage contains user data, **When** CurrentUser() is called, **Then** it returns a properly instantiated User entity with all properties correctly mapped
3. **Given** SessionStorage is empty or contains invalid data, **When** CurrentUser() is called, **Then** it returns null or undefined
4. **Given** a logged-in user opens the configuration dropdown menu, **When** they view the menu options, **Then** they see a "Cerrar Sesión" (Logout) button positioned below the configuration button
5. **Given** a logged-in user, **When** they click the logout button, **Then** SessionStorage is cleared (user data and tokens), CurrentUser() returns null, and the user is redirected to the login view

---

### Edge Cases

- What happens when the API authentication endpoint is unreachable or times out?
  - System displays a network error toast in the current language and allows user to retry
  - Loading indicators are cleared to prevent UI freeze
  
- How does the system handle expired sessions?
  - SessionStorage data may include token expiration timestamp
  - On application initialization or protected actions, expired tokens trigger automatic logout and redirect to login
  
- What happens when SessionStorage is disabled or full?
  - System displays an error message indicating browser storage requirements
  - User cannot proceed without enabling SessionStorage
  
- How does the system handle malformed API responses?
  - Validation of API response structure before processing
  - Display generic error message if response doesn't match expected schema
  
- What happens if user data in SessionStorage is manually modified?
  - Data integrity validation on retrieval
  - Invalid data triggers logout and redirect to login
  
- How does the system handle concurrent login attempts (multiple tabs)?
  - SessionStorage is shared across tabs, so login in one tab makes user authenticated in all tabs
  - Event listeners could notify other tabs of authentication state changes

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a User entity extending BaseEntity with properties matching the API authentication response structure (oid, usuario, fkSistema, sistema, fkEmpleado, empleado, createdAt, updatedAt, creado_por, editado_por, estatus)
  
- **FR-002**: System MUST decorate the User entity with appropriate decorators (@PropertyName, @Required, @StringTypeDef, @PrimaryProperty, etc.) following framework conventions
  
- **FR-003**: System MUST configure the User entity with @Module decorator specifying login endpoint (POST /auth/login) without standard REST methods
  
- **FR-004**: System MUST override the User entity's onSaved() hook to handle authentication-specific logic (clear password, save to SessionStorage, redirect to `/home` route on success)
  
- **FR-005**: System MUST create a LoginView.vue component that renders a form with username and password input fields using the framework's form rendering system
  
- **FR-006**: LoginView MUST instantiate a new User entity and bind form inputs to entity properties (usuario, contraseña)
  
- **FR-007**: LoginView MUST call the save() method on the User entity (equivalent to login) when the user submits the form
  
- **FR-008**: System MUST display validation errors and mark input fields as invalid when authentication fails
  
- **FR-009**: System MUST display success/error toast notifications in the currently selected language using GetLanguagedText() from common.json
  
- **FR-010**: Application.vue MUST implement a SaveUserData(user: User) function that serializes the user object (excluding password) and stores it in SessionStorage
  
- **FR-011**: Application.vue MUST implement a CurrentUser() function that retrieves user data from SessionStorage and returns a properly instantiated User entity
  
- **FR-012**: Application.vue MUST check authentication status on initialization and redirect to LoginView if no valid user data exists in SessionStorage
  
- **FR-013**: System MUST add a route for the login view in the router configuration (e.g., /login)
  
- **FR-014**: System MUST configure the LoginView route to not require authentication (using @NotRequiresLogin decorator or router meta flag)
  
- **FR-015**: All user-facing text in the login flow MUST be internationalized using i18n labels from common.json with keys for username, password, login button, error messages, and validation feedback
  
- **FR-016**: System MUST clear the password field from memory after sending to API to prevent password from being stored in SessionStorage
  
- **FR-017**: System MUST handle API response structure matching the auth_service specification (access_token, refresh_token, usuario object)
  
- **FR-018**: System MUST store access_token and refresh_token from API response in SessionStorage for subsequent authenticated requests using the framework's axios interceptor configuration
  
- **FR-019**: System MUST add a "Cerrar Sesión" (Logout) button in the configuration dropdown menu, positioned below the configuration button
  
- **FR-020**: System MUST implement logout functionality that clears all SessionStorage data (user data, access_token, refresh_token) and redirects to the login view
  
- **FR-021**: System MUST create i18n entries in common.json for all authentication-related text before implementation, checking for existing keys to avoid duplication (required keys: username/usuario, login, logout/log_out, authentication error messages, success messages)

### Key Entities

- **User**: Represents an authenticated user in the system
  - Core attributes: oid (unique identifier), usuario (username), contraseña (password - transient, not stored)
  - Related data: fkSistema (foreign key to system), sistema (embedded system data)
  - Related data: fkEmpleado (foreign key to employee), empleado (embedded employee data)
  - Metadata: createdAt, updatedAt, creado_por, editado_por, estatus
  - Authentication tokens: access_token and refresh_token (both stored in SessionStorage using keys from AppConfiguration)
  - Relationship: Connected to existing AppConfiguration for token storage keys

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully authenticate and access the application in under 5 seconds from entering credentials (assuming normal network latency)
  
- **SC-002**: Unauthenticated users are automatically redirected to login view within 500ms of application initialization
  
- **SC-003**: 100% of user-facing login text (labels, buttons, messages) displays correctly in all three supported languages (English, Spanish, Japanese)
  
- **SC-004**: Login form provides immediate visual feedback for validation errors within 100ms of form submission failure
  
- **SC-005**: User session persists across browser refreshes without requiring re-authentication until session expiration
  
- **SC-006**: System handles authentication failures gracefully with user-friendly error messages in the selected language, allowing unlimited retry attempts
  
- **SC-007**: User password is never stored in SessionStorage or browser memory after authentication completes, maintaining security best practices

## Assumptions

- The backend API auth_service is already implemented and available at the configured API base URL
- The API follows the exact response structure specified in the authentication documentation (access_token, refresh_token, usuario object)
- Argon2 password hashing is handled entirely by the backend; the frontend sends plaintext passwords over HTTPS
- Automatic token refresh logic is deferred (marked as technical debt); manual re-login required when access_token expires
- The framework's existing form rendering system (ComponentContainerComponent, form inputs) can accommodate a standalone login view
- SessionStorage is the appropriate persistence mechanism for user data and authentication tokens (as opposed to localStorage or cookies)
- Token storage keys (authTokenKey, authRefreshTokenKey) are already configured in AppConfiguration
- The router configuration allows adding routes that bypass the standard module-based routing pattern
- A `/home` route exists or will be created as the post-login landing page
- The configuration dropdown menu in TopBar can accommodate an additional logout button
- System and Employee data from related services (catalogues_service, branch_service) are embedded in the API response and don't require separate fetching

## Technical Constraints

- Must follow the framework's meta-programming architecture using decorators and BaseEntity
- Must use existing Application singleton methods and services (ApplicationUIService, eventBus, router)
- Must integrate with existing i18n system using GetLanguagedText() helper
- Cannot modify BaseEntity core save() logic; must use lifecycle hooks (beforeSave, afterSave, onSaving, onSaved)
- Must respect framework's reactive refs and Vue 3 Composition API patterns
- Authentication state changes must use Application.View to maintain consistency with framework navigation pattern
- Must use framework's toast notification system for user feedback
- All form validation must use the framework's decorator-based validation system
- Must check existing i18n keys in common.json, errors.json, and custom.json before creating new translation entries

## Technical Debt

- **TD-001**: Automatic token refresh logic is deferred to a future phase. While refresh_token is stored in SessionStorage, the automatic refresh mechanism when access_token expires is not implemented in this phase. Current implementation will require manual re-login when access_token expires.

## Out of Scope

- Password reset functionality
- "Remember me" / persistent login across browser sessions
- Social authentication (OAuth, SAML, etc.)
- Two-factor authentication (2FA)
- Account registration / user creation
- Profile management after login
- Automatic token refresh when access_token expires (marked as technical debt TD-001)
- Role-based access control (RBAC) or permission checking beyond basic authentication
- Login attempt rate limiting (handled by backend)
- CAPTCHA or bot detection integration
- Session timeout warnings or countdown timers
- Logout from all devices / remote session invalidation
