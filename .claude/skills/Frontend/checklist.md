---
name: Frontend-checklist
description: 프론트엔드 PR 리뷰 체크리스트. 프론트엔드 코드 리뷰, 스타일링 검증, 컴포넌트 패턴 확인 시 사용.
estimated_tokens: ~800
---

# Frontend PR Checklist

> 개발 방법: `.claude/skills/Frontend/`
> 프로젝트 정보: `.claude/context/frontend/INDEX.md`

## React Components

- [ ] Hook dependency arrays correct (useEffect, useMemo, useCallback)
- [ ] No unnecessary re-renders
- [ ] Unique key props on list items
- [ ] Event handler cleanup (useEffect return)
- [ ] Conditional rendering edge cases handled
- [ ] Loading/error/empty states handled
- [ ] Single responsibility (SRP)

## State Management

- [ ] State location appropriate (local vs global)
- [ ] No unnecessary global state
- [ ] Derived state computed instead of stored
- [ ] State updates batched properly
- [ ] Optimistic updates used appropriately

## TypeScript

- [ ] No unjustified `any` usage
- [ ] Strict null checks
- [ ] Generic constraints appropriate
- [ ] Props types clearly defined
- [ ] Discriminated unions utilized

## Styling

- [ ] Consistent styling approach (CSS-in-JS, Tailwind, etc.)
- [ ] Responsive design
- [ ] Dark mode support (if needed)
- [ ] z-index management
- [ ] Animation performance (transform, opacity)

## Accessibility (a11y)

- [ ] Semantic HTML used
- [ ] aria attributes appropriate
- [ ] Keyboard navigation works
- [ ] Focus management
- [ ] Sufficient color contrast

## Performance

- [ ] Bundle size impact checked
- [ ] Lazy loading (React.lazy, dynamic import)
- [ ] Image optimization (next/image, srcset)
- [ ] Memoization appropriate (avoid excessive useMemo)
- [ ] Virtualization needed (long lists)

## Async Handling

- [ ] Loading states displayed
- [ ] Error boundaries applied
- [ ] AbortController for request cancellation
- [ ] Race conditions prevented
- [ ] Retry logic (if needed)

## Form Handling

- [ ] Validation (client + server)
- [ ] User-friendly error messages
- [ ] Duplicate submission prevention
- [ ] Form state reset properly

## Testing

- [ ] Component unit tests
- [ ] User interaction tests
- [ ] Snapshot tests needed
- [ ] E2E tests updated
- [ ] Mocks used appropriately

## Security

- [ ] XSS prevention (careful with dangerouslySetInnerHTML)
- [ ] No sensitive data exposed to client
- [ ] HTTPS used
- [ ] External library security vulnerabilities checked

---

## YesTravel Frontend Conventions

### Styling Rules (MANDATORY)

- [ ] **tailwind-styled-components required** - No `className` prop usage
- [ ] **Styled components at bottom** - All `tw.*` definitions at file bottom
- [ ] **Conditional props with $prefix** - Use `$primary`, `$active` (not `primary`)

```typescript
// Correct
const Button = tw.button<{ $primary?: boolean }>`
  px-4 py-2
  ${({ $primary }) => $primary ? 'bg-blue-500' : 'bg-gray-500'}
`;

// Wrong - className usage
<div className="flex flex-col" />
```

### Icons

- [ ] **lucide-react only** - No font emojis, no custom SVG
- [ ] **Consistent sizing** - Use `size` prop for icon dimensions

```typescript
import { Home, Search } from 'lucide-react';
<Home size={20} />
```

### Color Variables

- [ ] **stroke-* variables with var()** - Must use `var()` function for stroke colors

```typescript
// Correct
<div className="outline-[var(--stroke-neutral)]" />
<input className="border-[var(--stroke-hover)]" />

// Wrong - conflicts with SVG stroke
<div className="outline-stroke-neutral" />
```

- [ ] **Other colors normal** - `fg-*`, `bg-*` can be used directly

```typescript
<div className="bg-bg-layer text-fg-neutral" />
```

### Font

- [ ] **No font-['Min_Sans_VF']** - Font is globally configured in tailwind.config.ts

### Modal Pattern (react-snappy-modal)

- [ ] **useCurrentModal().resolveModal()** - NOT `SnappyModal.close()`
- [ ] **Modal + open function in same file** - Export `open{Name}Modal` function
- [ ] **Promise-based** - Use `.then()` to handle modal result

```typescript
import SnappyModal, { useCurrentModal } from 'react-snappy-modal';

function MyModal() {
  const { resolveModal } = useCurrentModal();

  const handleConfirm = () => resolveModal({ data: 'value' });
  const handleCancel = () => resolveModal(null);

  return <div>...</div>;
}

export function openMyModal() {
  return SnappyModal.show(<MyModal />);
}
```

### Notifications

- [ ] **No alert()** - Use `toast` from `sonner`

```typescript
import { toast } from 'sonner';
toast.success('Success message');
toast.error('Error message');
```

### State Management (Zustand)

- [ ] **Zustand for global state** - Use `create` from `zustand`
- [ ] **persist middleware** - For auth/session state

### Routing (TanStack Router)

- [ ] **File-based routing** - Routes in `src/routes/`
- [ ] **Protected routes** - Use `beforeLoad` for auth checks

### API Integration (tRPC)

- [ ] **useSuspenseQuery** - For data fetching with Suspense
- [ ] **useMutation with invalidate** - Invalidate queries after mutation

```typescript
const createMutation = trpc.module.create.useMutation({
  onSuccess: () => {
    trpc.useUtils().module.findAll.invalidate();
  },
});
```

### Form Handling (React Hook Form)

- [ ] **zodResolver** - Use Zod schema for validation
- [ ] **Controlled components** - Use `Controller` for custom inputs

### Component Patterns

- [ ] **MajorPageLayout** - Use for main page layouts
- [ ] **Suspense + fallback** - Use `TableSkeleton` for loading states
- [ ] **EmptyState** - Use for empty data states

### File Structure

- [ ] **_components folder** - Page-specific components in `_components/`
- [ ] **index.ts exports** - Organize exports via index files

### New Component Requirements

- [ ] **Description comment** - JSDoc comment explaining component purpose
- [ ] **Usage example** - Include usage example in comment

```typescript
/**
 * FileUpload - File upload component
 * Uploads images and provides preview.
 */
export interface FileUploadProps {
  /** URL of uploaded file */
  value?: string | null;
  /** Callback when upload completes */
  onChange: (url: string | null) => void;
}

/**
 * Usage:
 * <FileUpload value={imageUrl} onChange={setImageUrl} />
 */
```
