# Theme Compliance Audit Report - Onboarding Screens

**Date**: 2024
**Audit Scope**: Complete theme token compliance for all onboarding UI components
**Status**: 🔴 VIOLATIONS FOUND

---

## Executive Summary

- **Total Violations Found**: 6
- **By Type**: 
  - Hardcoded Colors in Inline Styles: 3
  - Inline Animation Definitions: 2
  - Inline Opacity Values: 1

All violations prevent full theme responsiveness and break the design token system.

---

## Detailed Findings

### File: ConsentScreen.tsx

#### Violation 1: Hardcoded Color in Inline Style (Dynamic Success Color)
- **Line**: 108
- **Component**: Checkbox button background
- **Current Code**:
  ```tsx
  style={{
    backgroundColor: parentConsented ? "var(--success)" : "var(--surface-raised)",
  }}
  ```
- **Issue**: Using CSS custom property `var(--success)` which is NOT a mapped theme token. Should use mapped tokens like `var(--action-success-bg)` or use Tailwind classes.
- **Impact**: Violates token consistency. `--success` is not in the tailwind.config.ts theme mapping.
- **Suggested Fix**:
  ```tsx
  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 mb-4 ${
    parentConsented
      ? "bg-action-success text-text-on-primary"
      : "bg-surface-raised text-text-primary"
  }`}
  ```
- **Reason**: Tailwind classes ensure theme consistency and eliminate inline styles. All color tokens must be mapped in tailwind.config.ts.

---

#### Violation 2: Hardcoded Animation in Inline Style (check-pop keyframe)
- **Line**: 135
- **Component**: Checkbox border div
- **Current Code**:
  ```tsx
  style={
    checkAnimation
      ? ({
          animation: "check-pop 0.3s ease-out",
        } as React.CSSProperties)
      : undefined
  }
  ```
- **Issue**: Hardcoded animation string with inline style. The `check-pop` animation is defined in component's `<style>` tag (line 150), not in src/styles.css. Should use Tailwind animation classes.
- **Impact**: Animation not centralized, makes theme/motion preference updates difficult.
- **Suggested Fix**:
  ```tsx
  className={`relative w-6 h-6 rounded-lg border-2 flex-shrink-0 transition-all duration-200
    ${checkAnimation ? "animate-checkbox-bounce" : ""}
    ${
      parentConsented
        ? "border-text-on-primary bg-text-on-primary"
        : "border-border-color bg-surface-card"
    }`}
  ```
- **Reason**: Animations should be defined once in src/styles.css and referenced via class. The `animate-checkbox-bounce` class already exists in styles.css (line 338).

---

#### Violation 3: Hardcoded Color in Inline Style (box-shadow with CSS custom property)
- **Line**: 166
- **Component**: Glow effect container
- **Current Code**:
  ```tsx
  style={{
    boxShadow: "0 0 24px var(--success-soft)",
  }}
  ```
- **Issue**: Using inline style for box-shadow with unmapped custom property `var(--success-soft)`. Should use Tailwind shadow classes instead.
- **Impact**: Shadow not part of theme hierarchy. Cannot be easily switched when theme changes.
- **Suggested Fix**:
  ```tsx
  className="absolute inset-0 rounded-2xl pointer-events-none animate-pulse shadow-elevated-2"
  ```
- **Reason**: Use predefined `shadow-elevated-*` classes from styles.css instead of inline box-shadow. If a success-specific glow is needed, add a Tailwind utility class to styles.css.

---

#### Violation 4: Inline Animation Keyframes (check-pop, check-draw)
- **Line**: 150-162
- **Component**: `<style>` tag within component
- **Current Code**:
  ```tsx
  <style>{`
    @keyframes check-pop {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    @keyframes check-draw {
      0% {
        stroke-dasharray: 20;
        stroke-dashoffset: 20;
      }
      100% {
        stroke-dasharray: 20;
        stroke-dashoffset: 0;
      }
    }
  `}</style>
  ```
- **Issue**: Animation keyframes defined inside component's local style tag instead of centralized in src/styles.css.
- **Impact**: Duplicates the `animate-checkbox-bounce` definition already in styles.css (line 338). Creates maintenance burden and inconsistency. The `check-draw` animation is similar to `animate-checkbox-draw` in styles.css.
- **Suggested Fix**: Remove the `<style>` block and use existing Tailwind classes:
  - `animate-checkbox-bounce` for the pop effect
  - `animate-checkbox-draw` for the SVG draw effect
- **Reason**: All animations must be centralized in src/styles.css for maintainability and to ensure theme consistency.

---

### File: AgeScreen.tsx

#### Violation 5: Inline Animation in Style Attribute (scale-pop animation)
- **Line**: 62-70
- **Component**: Age band button
- **Current Code**:
  ```tsx
  style={
    animatingAge === band.value
      ? ({ animation: "scale-pop 0.3s ease-out" } as React.CSSProperties)
      : undefined
  }
  ```
- **Issue**: Animation applied via inline style instead of Tailwind class. The `scale-pop` keyframe is defined in src/styles.css (line 445), but applied via style prop instead of class.
- **Impact**: Violates pattern - animations should be applied via Tailwind classes, not inline styles.
- **Suggested Fix**:
  ```tsx
  className={`relative rounded-2xl p-4 transition-all duration-300 flex items-center gap-4 text-left
    ${
      isSelected
        ? `${band.gradient} text-text-on-primary shadow-elevated-2 scale-105`
        : "bg-surface-card text-text-primary border-2 border-surface-sunken hover:border-surface-raised"
    }
    ${animatingAge === band.value ? "animate-scale-pop" : ""}
  `}
  ```
- **Reason**: Use `animate-scale-pop` class from styles.css instead of inline animation style.

---

#### Violation 6: Inline Animation Keyframe Definition (scale-pop)
- **Line**: 85-90
- **Component**: `<style>` tag within component
- **Current Code**:
  ```tsx
  <style>{`
    @keyframes scale-pop {
      0% { transform: scale(1); }
      50% { transform: scale(1.08); }
      100% { transform: scale(1); }
    }
  `}</style>
  ```
- **Issue**: Keyframe defined locally in component instead of using centralized definition from src/styles.css. The `@keyframes scale-pop` already exists in styles.css (line 445).
- **Impact**: Component-local duplicate of existing centralized animation. Creates confusion and maintenance issues.
- **Suggested Fix**: Remove the local `<style>` block entirely. Use existing `animate-scale-pop` class from styles.css.
- **Reason**: All keyframe definitions must be in src/styles.css only. This is already defined correctly there.

---

### File: AvatarScreen.tsx

**Status**: ✅ COMPLIANT
- No hardcoded colors found
- All colors use Tailwind token classes
- All animations use classes from styles.css
- All spacing uses Tailwind scale
- No inline styles with hardcoded values

**Notable Correct Patterns**:
- Line 45: Uses `ring-accent-4`, `shadow-elevated-1` ✓
- Line 84-87: Uses `animate-avatar-ring-glow`, `animate-avatar-bounce` ✓
- Line 51: Uses theme tokens like `text-on-primary` ✓

---

### File: create.tsx (Welcome/Router)

**Status**: ✅ COMPLIANT
- No UI components with theme violations in this file
- Only route management and state handling

---

## Summary by Violation Type

### Type 1: Hardcoded Colors in Inline Styles (3 violations)
- ConsentScreen.tsx line 108 (backgroundColor)
- ConsentScreen.tsx line 166 (boxShadow)
- Total: 2 instances

### Type 2: Inline Animations Instead of Classes (2 violations)
- ConsentScreen.tsx line 150-162 (check-pop, check-draw keyframes)
- AgeScreen.tsx line 85-90 (scale-pop keyframe)
- Total: 2 instances

### Type 3: Inline Animation Style Props (2 violations)
- ConsentScreen.tsx line 135 (animation style prop)
- AgeScreen.tsx line 62-70 (animation style prop)
- Total: 2 instances

---

## Root Causes

1. **Inconsistent Pattern Usage**: Some components use Tailwind classes correctly (AvatarScreen) while others use inline styles (ConsentScreen, AgeScreen).

2. **Duplicate Animation Definitions**: Multiple animations defined both in component local `<style>` tags AND in src/styles.css, creating duplicates:
   - `check-pop` / `animate-checkbox-bounce`
   - `check-draw` / `animate-checkbox-draw`
   - `scale-pop` / `animate-scale-pop`

3. **CSS Custom Properties Confusion**: Mixing mapped tokens (like `bg-action-success`) with unmapped custom properties (like `var(--success)`, `var(--success-soft)`).

4. **Missing Fallback in Tailwind Config**: Some CSS custom properties used in components are not mapped in tailwind.config.ts theme colors.

---

## Recommendations

### Immediate Actions (Before Test)
1. Remove all `<style>` blocks from ConsentScreen.tsx and AgeScreen.tsx
2. Replace inline animation styles with Tailwind animation classes
3. Replace inline backgroundColor styles with Tailwind color classes
4. Replace inline boxShadow styles with shadow token classes

### Long-term Standards
1. **No inline styles**: Except for dynamic CSS custom properties like `var(--rotation)` where the value is calculated
2. **All colors**: Must come from tailwind.config.ts theme mapping
3. **All animations**: Define in src/styles.css, apply via Tailwind classes only
4. **All shadows**: Use `shadow-elevated-*` hierarchy, no inline box-shadow

### Verification Checklist
- [ ] No `style={{` in onboarding components except for calculated values
- [ ] No `animation:` in inline styles
- [ ] No `backgroundColor:`, `boxShadow:` in inline styles
- [ ] All animation classes reference existing src/styles.css definitions
- [ ] All color tokens match tailwind.config.ts mappings
- [ ] No duplicate keyframe definitions in component `<style>` tags

---

## Test Recommendations

After fixes, verify:
1. **Theme Switching**: Toggle between light/dark themes - all colors should update automatically
2. **Motion Preferences**: Enable `prefers-reduced-motion` - animations should disable correctly
3. **Animation Consistency**: Compare animation timing/curves with other screens
4. **Cross-device**: Test on mobile/tablet - spacing and sizing should adapt correctly

