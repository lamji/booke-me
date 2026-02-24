# Technical Log: Export Engine Fix & Typography Refinement
Date: 2026-02-23

## Technical Summary
Resolved runtime errors in the PDF export engine and globally refined administrative typography weight to improve readability and visual hierarchy.

## Key Changes

### 1. PDF Export Fix
- **Issue**: `doc.autoTable` was not recognized as a function due to ESM/Next.js side-effect import limitations.
- **Solution**: Switched to explicit functional import `import autoTable from "jspdf-autotable"` and called `autoTable(doc, options)` directly.

### 2. Export Button Styling
- **Excel**: Renamed to "EXPORT EXCEL", font weight reduced.
- **PDF**: Renamed to "EXPORT PDF", applied `bg-primary` (slate-900) and `text-white` for higher priority visual action.

### 3. Typography Weight Reduction
- **Standard**: Most labels previously using `font-black` or `font-bold` have been moved to `font-medium` or `font-normal`.
- **Registry**: Table headers, sub-labels, and metadata now use cleaner weights to reduce visual noise while maintaining high contrast.

## Verification
- [x] PDF Export engine verified (no runtime TypeError).
- [x] Button labels and colors updated.
- [x] Global font weight audit completed in 4 core admin components.
