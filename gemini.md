# Gemini AI Instructions & Project Context

Welcome to the **AuthntcG Web OS** project. As an AI agent working on this codebase, you must adhere to the following architecture rules, patterns, and historical context to avoid breaking existing features.

## 1. Tech Stack & Build System
- **Pure Vanilla JS & HTML5**: No React, Vue, or Svelte.
- **Tailwind CSS (CDN)**: Uses `https://cdn.tailwindcss.com`. No Node.js build steps or PostCSS pipelines are configured.
- **Custom Web Components**: UI elements are wrapped in `customElements.define` (e.g., `<app-window>`, `<app-button>`).

## 2. Architecture: Web OS
The project mimics a Desktop Operating System.
- `index.html` is the Desktop environment.
- `script.js` contains the `WindowManager` and `UIManager`.
- **Sub-Apps (The Iframe Rule)**: All applications (`about.html`, `qr-code-generator`, `inspiro`, `object-detection`) are strictly loaded as **Iframes** inside the `<app-window>` component. 
  - **DO NOT** attempt to inject raw HTML (`innerHTML`) for sub-apps, as it causes CSS leakage and breaks `container-queries`.

## 3. Critical Code Patterns
- **State Persistence**: Window positions, sizes, and open states are saved to `localStorage('authntcg-desktop-windows')` via `WindowManager.saveState()`.
- **Theme Syncing**: `UIManager` saves the theme to `localStorage('authntcg-theme')` and broadcasts theme changes to iframes by directly mutating `iframe.contentDocument.documentElement.setAttribute('data-bs-theme')`.
- **Z-Index Bubbling**: To prevent iframe clicks from being ignored by the window manager, iframes contain `mousedown` listeners that increment the parent's `AppZIndex`.

## 4. Known Pitfalls & Gotchas (DO NOT REPEAT)
- **TensorFlow.js Object-Fit Bug**: In `project/object-detection`, `tf.browser.fromPixels` reads the *CSS stretched dimensions* of an `<img>` tag if it has `w-full h-full`. This causes bounding boxes to be wildly inaccurate. **Solution**: We implemented an `offscreenImg` (Image object not in DOM) to feed TF.js the true natural pixels, and mapped it back to the UI using aspect-ratio (letterboxing) math. DO NOT revert this.
- **Git Checkout Danger**: Be extremely careful when using `git checkout <file>` to revert syntax errors. It will revert uncommitted architectural changes. Use Python/PowerShell text replacement tools carefully instead.
- **Container Queries**: Tailwind container queries (`@container` and `@lg:`) are heavily used in Bento Grids. Do not replace them with standard media queries (`md:`, `lg:`) inside sub-apps, as their width depends on the floating window size, not the monitor viewport.
- **Clean Development Environment**: Always delete any Python scripts, scratch HTML files, or temporary development assets (`fix.py`, `update_docs.py`, etc.) immediately after they have served their purpose. Do not leave garbage files in the repository.
- **Continuous Documentation Synchronization**: Always read the documentation in the `/docs/` folder before answering questions, writing code, or fixing bugs to ensure full architectural context. Furthermore, you MUST proactively update the relevant documentation files immediately whenever you introduce new features, change architectures, or modify behaviors during development.
- **Token Optimization**: Always employ tools and methodologies that optimize token usage. When reading or modifying large files, use precise text-replacement scripts (Python/PowerShell) or search tools (`Select-String`) instead of dumping entire file contents into the context window. Keep responses and explanations concise unless deep analysis is requested.
- **Git Restrictions**: **NEVER** execute `git commit`, `git push`, or alter the git history/remote repository unless explicitly commanded by the user.
