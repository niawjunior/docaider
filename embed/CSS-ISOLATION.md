# CSS Isolation Strategy for Docaider Embed

## Problem
When embedding the Docaider chat widget on third-party websites, CSS from the embed script was overriding the host website's styles, causing visual conflicts and breaking the host site's design.

## Solution
We've implemented a comprehensive CSS isolation strategy to ensure the embed widget's styles don't interfere with the host website.

## Implementation Details

### 1. Container Scoping
All styles are scoped to `#docaider-embed-container`:
- This container is created dynamically in `main.tsx`
- All CSS rules are prefixed with `#docaider-embed-container`
- Prevents global style pollution

### 2. Tailwind Configuration
**File:** `tailwind.config.ts`
```typescript
important: "#docaider-embed-container"
```
This ensures all Tailwind utilities are scoped to the embed container.

### 3. CSS Variable Scoping
**Files:** `globals.css`, `App.css`, `main.tsx`
- All CSS variables are defined within `#docaider-embed-container`
- No `:root` level variables that could affect the host website
- Dynamic colors from config are also scoped

### 4. Comprehensive CSS Reset
**File:** `App.css`
- Uses `all: initial` and `all: revert` to reset inherited styles
- Prevents host website CSS from bleeding into the embed
- Maximum z-index (2147483647) ensures the widget stays on top

### 5. Font Loading
**File:** `main.tsx`
- Google Fonts are loaded but only applied within the embed container
- Font-family is enforced with `!important` on all child elements

### 6. Animation Scoping
**File:** `App.css`
- Custom animations are prefixed (e.g., `docaider-pulse`)
- Prevents conflicts with host website animations

## Key Files Modified

1. **`/embed/globals.css`**
   - Moved all `:root` variables to `#docaider-embed-container`
   - Scoped dark mode styles
   - Scoped utility classes

2. **`/embed/src/App.css`**
   - Added comprehensive CSS reset
   - Scoped all styles to embed container
   - Added element-specific resets

3. **`/embed/src/main.tsx`**
   - Changed inline styles from `:root` to `#docaider-embed-container`
   - Scoped color-scheme property

4. **`/embed/tailwind.config.ts`** (New)
   - Configured Tailwind to scope all utilities
   - Set up proper dark mode handling

## Testing Checklist

When testing the embed on a host website, verify:

- [ ] Host website's fonts are not affected
- [ ] Host website's colors remain unchanged
- [ ] Host website's layout is not disrupted
- [ ] Embed widget displays correctly
- [ ] Embed widget's styles are consistent
- [ ] No console errors related to CSS
- [ ] Widget works on websites with different CSS frameworks (Bootstrap, Tailwind, etc.)
- [ ] Widget works on websites with custom CSS

## Best Practices

1. **Always scope new styles** to `#docaider-embed-container`
2. **Never use global selectors** like `:root`, `body`, `html`, or `*` without the container prefix
3. **Test on multiple websites** with different CSS frameworks
4. **Use !important sparingly** - only for critical resets
5. **Prefix custom animations** to avoid naming conflicts

## Build Process

The build process (via Vite) bundles all CSS into `embed.css`:
- All Tailwind utilities are included
- All custom styles are included
- Everything is scoped to the container

## Future Improvements

Consider implementing Shadow DOM for even better isolation:
- Complete style encapsulation
- No need for scoping selectors
- Better protection against host website interference

However, Shadow DOM has trade-offs:
- More complex implementation
- Potential issues with global event listeners
- Limited browser support for some features
