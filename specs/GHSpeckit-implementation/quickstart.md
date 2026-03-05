# Quick Start: New CRUD Module in 15 Minutes

**Branch**: `001-framework-saas-spec`
**Date**: 2026-02-26
**Goal**: Functional CRUD module from zero (UC-001 acceptance test)

---

## Prerequisites

- Framework project running (`npm run dev`)
- `src/entities/` directory exists
- `src/models/application.ts` with `Application.registerModule(...)` block

---

## Step 1 — Create the Entity File (3 min)

Create `src/entities/product.ts`:

```typescript
import { BaseEntity } from '@/models/BaseEntity'
import {
  ModuleName, ApiEndpoint, ApiMethods, Persistent,
  DefaultProperty, PrimaryProperty, UniquePropertyKey, ModuleIcon
} from '@/decorations'
import {
  PropertyName, PropertyIndex, Required, CSSColumnClass, HelpText,
  HideInListView, Validation
} from '@/decorations'

@ModuleName('Products')
@ApiEndpoint('/api/products')
@ApiMethods(['GET', 'POST', 'PUT', 'DELETE'])
@Persistent()
@DefaultProperty('name')
@PrimaryProperty('id')
@UniquePropertyKey('id')
@ModuleIcon('box')
export class Product extends BaseEntity {
    @PropertyName('ID', Number)
    @PropertyIndex(0)
    @HideInListView()
    id!: number;

    @PropertyName('Name', String)
    @PropertyIndex(1)
    @Required(true, 'Product name is required')
    @CSSColumnClass('col-6')
    @HelpText('Enter the product display name')
    name!: string;

    @PropertyName('Price', Number)
    @PropertyIndex(2)
    @Required(true, 'Price is required')
    @Validation(p => p.price >= 0, 'Price must be non-negative')
    @CSSColumnClass('col-3')
    price!: number;
}
```

---

## Step 2 — Register the Module (1 min)

In `src/main.ts`, register the `Product` module:

```typescript
import { Product } from '@/entities/product'

// After Application.initializeApplication(router):
Application.registerModule(Product)
```

---

## Step 3 — Verify (11 min budget for backend wiring)

1. **Sidebar**: "Products" entry appears with box icon automatically
2. **Navigate to `/products`**: List view renders with `Name` and `Price` columns
3. **Click "New"**: Detail form renders with labeled inputs and help text for Name
4. **Validation**: Leaving Name empty → error message appears below input
5. **Save**: Sends `POST /api/products` with `{ name, price }`
6. **Edit row**: Sends `PUT /api/products/:id`

No additional UI code required. The framework auto-generates everything from decorators.

---

## What the Framework Generated Automatically

| Feature | Source |
|---|---|
| Sidebar entry "Products" | `@ModuleName` + `@ModuleIcon` |
| Route `/products` | `@ModuleName` → auto-registered by Application + Router |
| Table columns Name, Price | `@PropertyName` + `@PropertyIndex` + `@CSSColumnClass` |
| Form labels and inputs | `@PropertyName` type → input component |
| Required validation | `@Required(true, msg)` → error display below input |
| Custom validator | `@Validation(fn, msg)` |
| Help text | `@HelpText` → rendered below input |
| POST on new | `save()` detects `_isNew=true` → POST |
| PUT on existing | `save()` detects `_isNew=false` → PUT to `@ApiEndpoint/:id` |
| Delete button | `@ApiMethods` includes `DELETE` |

---

## Common Additions

### Add a text area

```typescript
import { TextAreaType } from '@/decorations'  // if available
// or use StringTypeDef for subtypes like email:
@StringTypeDef('email')
@PropertyName('Email', String)
@PropertyIndex(3)
email!: string;
```

### Group fields in sections

```typescript
@ViewGroup('Pricing')
@ViewGroupRow(1)
@PropertyName('Price', Number)
price!: number;

@ViewGroup('Pricing')
@ViewGroupRow(2)
@PropertyName('Tax Rate', Number)
taxRate!: number;
```

### Add async validation (email uniqueness)

```typescript
@AsyncValidation(
  async (entity) => {
    const response = await Application.axiosInstance.get(
      `/api/products/check-name?name=${entity.name}`
    )
    return response.data.available
  },
  'A product with this name already exists'
)
@PropertyName('Name', String)
name!: string;
```

### Override save behavior

```typescript
async beforeSave(): Promise<void> {
  // e.g. normalize price
  this.price = Math.round(this.price * 100) / 100
}

async afterSave(): Promise<void> {
  Application.showToast({ message: 'Product saved!', type: 'success' })
}
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Module not in sidebar | Not registered | `Application.registerModule(Product)` |
| CRUD fails with config error | Missing `@Persistent()` | Add `@Persistent()` to class |
| Properties not in form/table | Missing `@PropertyName` | Add `@PropertyName(label, type)` to each property |
| Save sends to wrong URL | Wrong `@ApiEndpoint` value | Check URL string (no trailing slash) |
| Form input not editable | `@Disabled` or `@ReadOnly` present | Remove or adjust condition |
