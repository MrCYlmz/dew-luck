# Contributing to Dew-Luck

Thanks for your interest in contributing! This is a small, fully client-side Vue 3 app, so getting started is quick.

## Getting started

```bash
git clone https://github.com/MrCYlmz/dew-luck.git
cd dew-luck
npm install
npm run dev      # http://localhost:5173
```

Requirements: Node.js 20.19+ or 22.12+.

## Making changes

1. Fork the repository and create a branch from `main` (e.g. `feature/my-change` or `fix/my-bug`).
2. Make your changes. Keep them focused — one feature or fix per pull request.
3. Run `npm run build` before opening a PR; it type-checks with `vue-tsc` and must pass.
4. Open a pull request against `main` and describe what you changed and why.

There is currently no test suite or linter configured, so please test your change manually in the browser.

## Project conventions

- **Persistence** goes through `src/requests/requests.ts` (async functions over `localStorage`). Don't read or write `localStorage` directly from components.
- **Dialogs** use the native `<dialog>` element and expose `openDialog()` / `closeDialog()` via `defineExpose`; parents control them through template refs rather than visibility props.
- **Imports**: prefer the `@/` alias (maps to `src/`) for cross-directory imports.
- Match the style of the surrounding code.

## Reporting bugs and requesting features

Please use the [issue templates](https://github.com/MrCYlmz/dew-luck/issues/new/choose). For bugs, include steps to reproduce and your browser/version.

## Code of Conduct

By participating you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).
