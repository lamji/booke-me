# Memory: Next.js 15+ Dynamic Routing & Admin Layout Stability

## Context
When working with Next.js API routes or Page components in newer versions (15+), dynamic route parameters (`params`) are now asynchronous. Accessing them directly (e.g., `params.id`) causes type errors and build failures.

## Solution: Async Params
Always treat `params` as a `Promise` in the type definition and `await` it before use.

```typescript
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ...
}
```

## Solution: Flexbox Layout Stability
In high-density admin dashboards (like Chat or Messenger views), long strings or nested flex containers can cause "layout breaking" (horizontal overflow) if not properly constrained.

1. **Truncation/Wrapping**: Use `truncate` (for one line) or `break-words whitespace-pre-wrap` (for multi-line) on the text element.
2. **Flex Constraint**: The parent flex-grow child MUST have `min-w-0` to allow its own children to truncate or wrap instead of expanding the parent's width.

```tsx
<div className="flex-1 min-w-0">
  <p className="truncate">This will now properly truncate instead of pushing the parent wider.</p>
</div>
```

## Verification
Applied these patterns to `ChatManager.tsx` and `app/api/reviews/[id]/route.ts` to achieve 100% build pass and stable responsive UI.
