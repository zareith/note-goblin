# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Note Goblin is a user-friendly privacy-focused markdown editor and notes manager that runs entirely in the browser. It's built with Preact, TypeScript, and modern web technologies, featuring a Progressive Web App (PWA) architecture with offline capabilities.

## Development Commands

### Essential Commands
- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production (includes GitHub Pages deployment setup)  
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm preview` - Preview production build locally
- `pnpm deploy` - Deploy to GitHub Pages (publishes to notegobl.in)

### Package Manager
This project uses `pnpm` as the package manager. Always use `pnpm` instead of `npm` or `yarn` for consistency.

## Architecture Overview

### State Management
- **Jotai**: Primary state management using atoms with Immer integration
- **Store**: Centralized store in `src/state/store.ts` 
- **Key State Files**:
  - `src/state/files.ts` - File system operations, workspace management, markdown rendering
  - `src/state/ui.ts` - UI layout and interaction state

### Component Architecture
- **Preact**: Uses Preact instead of React for smaller bundle size
- **Custom JSX Helpers**: `src/utils/preact.ts` provides `h` and `h_` functions for concise JSX
- **StyleX**: CSS-in-JS styling with `@stylexjs/stylex`
- **RSuite**: Component library for UI elements

### File System Integration
- **Browser FS Access**: Uses File System Access API for native file operations
- **Workspace Model**: Directory-based workspace management with tree navigation
- **Auto-save**: Debounced auto-save functionality (500ms delay)
- **File Formats**: Supports `.md`, `.markdown`, `.txt`, `.text` files

### Editor Features
- **CodeMirror**: Primary editor with markdown language support
- **Toast UI Editor**: Alternative rich text editor
- **Live Preview**: Real-time markdown rendering with DOMPurify sanitization
- **Mermaid**: Diagram support via codemirror-lang-mermaid

### PWA Features
- **Service Worker**: Custom service worker in `src/sw.ts`
- **Offline Support**: Uses Workbox for caching strategies
- **Manifest**: PWA manifest configured in `vite.config.ts`

## Key Technical Patterns

### Component Creation
Use the custom Preact helpers for cleaner code:
```typescript
import { h, h_ } from "../utils/preact"

// Instead of h(Component, { props }, children)
// Use h_(Component, children) for components without props
```

### State Updates
Use Jotai with Immer for immutable updates:
```typescript
import { atomWithImmer as atomI } from "jotai-immer"

const myAtom = atomI(initialState)
store.set(myAtom, draft => {
    // Direct mutations to draft object
    draft.property = newValue
})
```

### File Operations
File operations go through `src/actions/files.ts`:
- `openFile()` - Open existing files
- `openNewFile()` - Create new files with date-based naming
- `save()` - Manual save with File System Access API
- `updateFile()` - Update content with auto-save scheduling

### Keyboard Shortcuts
Global shortcuts are bound in `src/index.ts`:
- `Ctrl/Cmd+S` - Save current file
- `Ctrl/Cmd+O` - Open file dialog

## Build Configuration

### Vite Setup
- **Base Path**: Configurable via `BASE_PATH` environment variable
- **Alias**: CodeMirror state resolution alias to prevent duplicate instances
- **Plugins**: Preact preset, StyleX, PWA plugin

### TypeScript
- **Target**: ES2020 with ESNext modules
- **JSX**: React JSX with Preact import source
- **Paths**: React/React-DOM aliased to Preact compat layer

### Deployment
- **GitHub Pages**: Automated deployment via `gh-pages` package
- **Domain**: Custom domain `notegobl.in` configured
- **404 Handling**: SPA routing handled by copying index.html to 404.html

## Development Guidelines

### Adding New Components
1. Create component files in `src/components/`
2. Use StyleX for component-scoped styles
3. Export default function components
4. Use TypeScript interfaces for props

### State Management
1. Create atoms in appropriate `src/state/` files
2. Use `atomWithImmer` for complex state objects
3. Access store via hooks in components or direct store access in actions
4. Keep side effects in `src/actions/` files

### File System Features
1. Extend `src/actions/files.ts` for new file operations
2. Update workspace tree state via `useWorkspace$()` hook
3. Handle File System Access API permissions appropriately

### Testing New Features
Since this is a browser-based application, test in multiple browsers:
- Chromium-based browsers (recommended for File System Access API)
- Test PWA features in production builds
- Verify offline functionality with network throttling
