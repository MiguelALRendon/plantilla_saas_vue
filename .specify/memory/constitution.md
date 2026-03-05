<!--
SYNC IMPACT REPORT
==================
Version Change: TEMPLATE → 1.0.0
Constitution Creation Date: 2026-02-26

PRINCIPLES ESTABLISHED:
- I. MI LÓGICA - 4 Immutable Axioms (NON-NEGOTIABLE)
- II. SPEC-FIRST Design
- III. Documentation-Code Synchronization (NON-NEGOTIABLE)
- IV. Architectural Authorization
- V. Contract Hierarchy
- VI. Tech Stack Immutability

TEMPLATES REQUIRING UPDATES:
✅ plan-template.md - Verify "Constitution Check" aligns with 4 AXIOMS
✅ spec-template.md - Verify scope/requirements alignment with SPEC-FIRST principle
✅ tasks-template.md - Verify task categorization reflects principles
✅ Constitution propagated across all command files

FOLLOW-UP TODOs:
- None. All critical principles from contracts captured.
- Template updates verified as aligned.
-->

# Framework SaaS Vue Constitution

## Core Principles

### I. MI LÓGICA - 4 Immutable Axioms (NON-NEGOTIABLE)

**MI LÓGICA** constitutes the **immutable technical axiom system** of the framework. These 4 AXIOMS are **absolute**, **non-negotiable**, and **supersede all other considerations** including optimization, modernization, convenience, or performance.

**AXIOM A1 [5-Layer Architecture]:**
- Every component MUST belong to exactly one of the 5 layers: Entities (Definition) → Decorators (Metadata) → BaseEntity (CRUD Logic) → Application (Orchestrator) → UI Components (Generated)
- No additional layers may be introduced between existing layers
- Layer hierarchy MUST be preserved

**AXIOM A2 [Unidirectional Data Flow]:**
- Data flow MUST be strictly unidirectional: Entity → Decorators → Metadata → BaseEntity → Application → UI
- NO layer may bypass any intermediate layer
- NO bidirectional data flow permitted

**AXIOM A3 [Metadata-Driven UI Generation]:**
- ALL UI components MUST be generated as pure deterministic functions of metadata
- UI components MUST NOT contain business logic not derived from metadata
- Form generation, table rendering, and validation MUST originate exclusively from decorators

**AXIOM A4 [Immutable Tech Stack]:**
- Stack is permanently: **TypeScript + Vue 3 + Decorators**
- Metadata storage MUST remain in `BaseEntity.prototype`
- Decorators CANNOT be replaced by JSON config or external systems
- Vue 3 CANNOT be replaced by React, Angular, or any alternative

**Violation Detection:** ANY of the following constitutes violation of MI LÓGICA and is strictly **PROHIBITED**:
- Adding intermediate layers (e.g., Layer 2.5 between Decorators and BaseEntity)
- UI directly accessing Entity without Application layer
- UI component with non-metadata-derived logic
- Replacing decorators with JSON configuration
- Changing Vue 3 to React or any other framework
- Moving metadata from prototype to external Map/WeakMap
- Implementing bidirectional data flow

**Hierarchical Supremacy:**
```
MI LÓGICA (AXIOMS A1-A4)
    ├──> Invalidates: Any contradictory contractual clause
    ├──> Invalidates: Any optimization violating axioms
    ├──> Invalidates: Any proposed improvement altering structure
    └──> Prevails: Over convenience, performance, modernization
```

**Validation Procedure for ALL changes:**
```
FOR EVERY proposed change:
  1. Verify(A1) → Respects 5 layers? [YES/NO]
  2. Verify(A2) → Maintains unidirectional flow? [YES/NO]
  3. Verify(A3) → UI still generated from metadata? [YES/NO]
  4. Verify(A4) → Preserves tech stack? [YES/NO]
  
  IF any verification = NO → REJECT change immediately
  IF all verifications = YES → Proceed with Section II-VI evaluation
```

### II. SPEC-FIRST Design

**Source of Truth:** Documentation in `.md` files constitutes the **aspirational source of truth**. NO code modification may occur without validating or updating the corresponding spec FIRST.

**Mandatory Flow:**
```
Spec (.md) → Define expected behavior
    ↓
Code (.ts) → Implement spec
    ↓
Validation → Verify coherence
```

**BEFORE CODING (OBLIGATORY):**
1. Read relevant documentation (contracts, layers/\*.md)
2. Verify existence of similar functionality
3. Determine if authorization required for major changes
4. **IF new functionality:** Update corresponding .md file FIRST with complete design
5. **IF modification:** Validate current spec is correct or update FIRST
6. Plan documentation structure

**DURING DEVELOPMENT:**
1. Follow patterns established in spec
2. Implement **exactly** what is specified in .md
3. Maintain type safety
4. Respect naming conventions

**AFTER CODING:**
1. **Synchronize documentation:** Verify code fulfills spec 100%
2. Update folder index files
3. Update cross-references
4. Test in complete context
5. Verify no breaking of existing functionality

**Principle:** Spec defines behavior → Code implements spec → Never the reverse.

### III. Documentation-Code Synchronization (NON-NEGOTIABLE)

**Absolute Rule:**
```
Code without documentation = Invalid code
Documentation without updates = Invalid documentation
```

**Mandatory for ALL modifications:**

**Changes to existing functionality:**
- Update corresponding .md file
- Maintain updated examples
- Update cross-references

**New functionality:**
- Create .md file in appropriate folder
- Follow established 11-section structure
- Add cross-references
- Update main index

**New decorators:**
- Create file in `layers/01-decorators/`
- Document metadata symbol
- Document accessor function in BaseEntity
- Add usage example

**Architecture changes:**
- Update `01-FRAMEWORK-OVERVIEW.md`
- Update `02-FLOW-ARCHITECTURE.md`
- Document migration if applicable

**Folder index maintenance:**
- Update README.md or INDEX.md in container folder
- Add entry for new element
- Maintain consistent order (alphabetical or categorical)
- Include brief element description
- Verify reference integrity

**PROHIBITION:** NO README.md or INDEX.md files may exist within `/src/` directory or any subdirectory. Documentation resides EXCLUSIVELY in `/copilot/`.

### IV. Architectural Authorization

**Major Changes REQUIRE EXPLICIT AUTHORIZATION** before implementation.

**Major Change Definition:** Any modification that alters core architecture, data flow, UI generation, state system, or persistence.

**Minor Change Definition:** Extension not modifying existing components: additional decorators, custom components, new entities, styles, utilities.

**Mandatory Request Process for Major Changes:**
1. Document proposed change in detail
2. Explain demonstrable necessity
3. Demonstrate no alternative exists within MI LÓGICA
4. Specify impact on existing system
5. **Wait for explicit approval** before proceeding

**Authorization Authority:** Only the framework **Architect** can authorize major changes, breaking changes, contractual exceptions, and contract modifications.

### V. Contract Hierarchy

**Normative Hierarchy (in case of interpretive conflict):**
```
MI LÓGICA (Axioms A1-A4 - Supreme Authority)
    ↓
00-CONTRACT.md (Master Contract)
    ↓
05-ENFORCEMENT-TECHNICAL-CONTRACT.md (Technical Enforcement)
    ↓
04-UI-DESIGN-SYSTEM-CONTRACT.md (UI/CSS Contract)
    ↓
06-CODE-STYLING-STANDARDS.md (Code Styling)
    ↓
01-FRAMEWORK-OVERVIEW.md (Descriptive)
    ↓
02-FLOW-ARCHITECTURE.md (Descriptive)
    ↓
03-QUICK-START.md (Guide)
```

**In case of conflict:** Higher authority prevails. MI LÓGICA invalidates any contradictory clause in subordinate contracts.

**Contract Integration:**
- **00-CONTRACT.md:** Defines what MI LÓGICA is and obligatory rules
- **05-ENFORCEMENT-TECHNICAL-CONTRACT.md:** Defines HOW to verify compliance
- **04-UI-DESIGN-SYSTEM-CONTRACT.md:** Defines design tokens and CSS rules
- **06-CODE-STYLING-STANDARDS.md:** Defines code formatting and structure standards
- **Descriptive docs:** Describe architecture but do not establish binding rules

### VI. Tech Stack Immutability

**Immutable Technology Stack:**
- **Language:** TypeScript (strict mode)
- **Framework:** Vue 3 (Composition API)
- **Meta-programming:** TypeScript Decorators (experimentalDecorators)
- **Metadata Storage:** BaseEntity.prototype
- **State Management:** Vue 3 Reactivity System
- **Routing:** Vue Router
- **HTTP Client:** Axios

**PROHIBITION:** The technology stack is **immutable**. NO component may be replaced, substituted, or modernized without violating AXIOM A4.

**Rationale:** The entire architecture is designed around this specific stack. Changing any component would require complete framework redesign, invalidating all existing implementations.

## Tech Stack Requirements

**Mandatory Technologies:**

**Core Stack:**
- TypeScript 5.x+ with `experimentalDecorators: true` and `emitDecoratorMetadata: true`
- Vue 3.x+ with Composition API
- Vite as build tool
- Axios for HTTP communication

**TypeScript Configuration (tsconfig.json) MUST include:**
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**Prohibited Dependencies:**
- React, Angular, Svelte (violates AXIOM A4)
- Pinia, Vuex (state managed by BaseEntity + Vue reactivity)
- Alternative decorator systems (violates AXIOM A4)
- JSON-schema systems replacing decorators (violates AXIOM A4)

**Decorator System Requirements:**
- ALL metadata MUST be stored via TypeScript decorators
- Metadata MUST reside in class prototype via Symbols
- NO external metadata storage systems permitted

## Development Workflow

**3-Phase Sequential Model:**

**PHASE 1: GENERATION BY AI**
- AI agent generates code
- AI executes **Mandatory Self-Verification (AOM - Autoverificación Obligatoria del Modelo)**
- AI declares contractual compliance
- AI identifies potential conflicts
- AI lists justified exceptions

**PHASE 2: MANUAL REVIEW**
- Architect reviews generated code
- Architect validates compliance declaration
- Architect verifies coherence with contracts
- Architect approves or rejects proposal
- Architect authorizes exceptions if justified

**PHASE 3: REPOSITORY INTEGRATION**
- Approved code integrated via git commit
- Pre-Commit Verification executes
- Synchronized documentation updates
- Folder indexes update
- Cross-references validate

**Enforcement Layers:**

**Layer 1 - Declarative Enforcement:**
- Mandatory AI model self-verification before delivery
- Explicit contractual compliance declaration
- Proactive identification of conflicts and exceptions

**Layer 2 - Manual Enforcement:**
- Architect technical review
- Architectural coherence validation
- Authorization of justified exceptions
- Contractual conflict resolution

**Layer 3 - Documentary Enforcement:**
- Code-documentation synchronization
- Folder index updates
- Cross-reference validation
- Documentary completeness verification

**Breaking Change Policy:**
- ALL breaking changes MUST follow mandatory process
- Documentation in `/copilot/BREAKING-CHANGES.md`
- Explicit architect approval
- Mandatory MAJOR versioning

**Exception Registry:**
- ALL exceptions MUST be registered in `/copilot/EXCEPCIONES.md`
- Explicit architect approval
- Mark in code with comment `// EXC-XXX`

**Cross-Layer Validation (VCC):** Verify coherence across:
- Entity ↔ Decorators
- Decorators ↔ Metadata
- Metadata ↔ UI
- API ↔ Backend

## Architectural Constraints

**11-Section Documentary Structure (MANDATORY):**

ALL technical documentation files MUST contain these 11 sections in exact order:
1. Propósito (Purpose)
2. Alcance (Scope)
3. Definiciones Clave (Key Definitions)
4. Descripción Técnica (Technical Description)
5. Flujo de Funcionamiento (Operation Flow)
6. Reglas Obligatorias (Mandatory Rules)
7. Prohibiciones (Prohibitions)
8. Dependencias (Dependencies)
9. Relaciones (Relationships)
10. Notas de Implementación (Implementation Notes)
11. Referencias Cruzadas (Cross-References)

**Exceptions:** README.md/INDEX.md in container folders, temporary state files, review files.

**Folder Index Requirements:**
- Every container folder (decorators, components, entities, etc.) MUST maintain an index file
- Index MUST list ALL elements in folder with brief description
- Index MUST update when elements are added, removed, or renamed
- NO index files permitted within `/src/` directory tree

**Code Styling Requirements:**
- Follow `06-CODE-STYLING-STANDARDS.md` contractually
- Indentation: 4 spaces (TypeScript/JavaScript), 2 spaces (Vue templates)
- Quotes: Single quotes for strings, template literals for interpolation
- Trailing commas: Mandatory in multiline arrays/objects
- Explicit typing: Mandatory for all variables/parameters/returns
- JSDoc: Mandatory for all public methods/functions
- Region comments: Mandatory for organizing class sections

## Governance

**Constitutional Authority:** This constitution, together with MI LÓGICA, supersedes all other practices, guidelines, and suggestions. NO practice, optimization, or modernization may violate these principles.

**Amendment Requirements:**
- Amendments require explicit architect authorization
- Must include: justification, impact analysis, migration plan
- Version increment according to semantic versioning:
  - **MAJOR:** Backward incompatible governance changes, principle removal/redefinition
  - **MINOR:** New principle/section added, materially expanded guidance
  - **PATCH:** Clarifications, wording fixes, non-semantic refinements

**Compliance Verification:** ALL code contributions, AI-generated code, and manual modifications MUST verify compliance with:
1. MI LÓGICA (4 AXIOMS) - Non-negotiable verification
2. SPEC-FIRST Design - Documentation updated FIRST
3. Documentation Synchronization - Code and docs coherent
4. Architectural Authorization - Major changes pre-approved
5. Contract Hierarchy - Correct precedence applied
6. Tech Stack Immutability - No stack component substitution

**Conflict Resolution Priority:**
```
1. MI LÓGICA (AXIOMS A1-A4) - Absolute priority
2. This Constitution
3. 00-CONTRACT.md
4. 05-ENFORCEMENT-TECHNICAL-CONTRACT.md
5. Specific technical contracts (04-UI, 06-CODE-STYLING)
6. Descriptive documentation
```

**Architect Responsibilities:**
- Final technical authority on all decisions
- Exclusive power to modify contracts
- Exclusive power to authorize exceptions and breaking changes
- Exclusive power to resolve contractual conflicts
- AI cannot modify contracts without explicit architect instruction

**Enforcement Mechanisms:**
- Mandatory AI Self-Verification (AOM) before code submission
- Manual architect review of all changes
- Pre-commit verification checklist
- Cross-layer coherence validation (VCC)
- Breaking change mandatory documentation
- Exception mandatory registration

**Consequences of Non-Compliance:**
- Code violating MI LÓGICA MUST be rejected immediately
- Undocumented changes MUST be rejected
- Major changes without authorization MUST be reverted
- Breaking changes without process MUST be reverted
- Unregistered exceptions are contractually invalid

**Quality Gates:**
- NO code integration without documentation synchronization
- NO major change without explicit authorization
- NO breaking change without registration in `BREAKING-CHANGES.md`
- NO exception without registration in `EXCEPCIONES.md`
- NO violation of 4 AXIOMS under ANY circumstance

**Runtime Development Guidance:** For detailed development procedures, enforcement processes, and detailed technical specifications, consult the contractual documentation hierarchy in `/copilot/` directory.

**Version**: 1.0.0 | **Ratified**: 2026-02-10 | **Last Amended**: 2026-02-26
