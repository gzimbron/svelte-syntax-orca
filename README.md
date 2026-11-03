# Svelte Syntax for Orca

Self-contained syntax highlighting for **`.svelte` components** in Orca 1.4.246
or newer. This is a Svelte plugin, not a SvelteKit integration.

Highlighting only: no autocomplete, language server, diagnostics, formatting,
compiler, commands, or runtime code. The plugin uses the `data` execution profile,
requests no capabilities, and needs no dependencies or build step to run in Orca.

## Installation

Once the repository and a version tag have been published:

1. Open **Settings → Plugins** in Orca and add a plugin.
2. Select **Git URL** and enter `https://github.com/gzimbron/svelte-syntax-orca`.
3. Continue, review, and activate **Svelte Syntax**.
4. Open a `.svelte` file in the source editor.

Without a tag or commit suffix Orca selects the latest version tag. The intended
first version is `v1.0.0`. This project does not create the remote repository,
release tag, or catalog submission automatically.

If highlighting is missing, confirm the plugin is enabled and reopen the file.
Disable it through **Settings → Plugins** when no longer needed.

## Highlighting coverage

- Official Svelte HTML/component tag, attribute, and comment rules, including
  `@component` documentation comments (plain comments, not Markdown).
- `{expressions}`, including balanced object/function braces and quoted strings.
- `if`, `each`, `await`, `key`, and `snippet` blocks; `else`, `then`, and `catch`.
- `{@html}`, `{@debug}`, `{@const}`, and `{@render}` tags; Svelte 5
  `{@attach ...}` attributes and script `generics` attributes.
- Directives such as `bind:value`, `on:click|preventDefault`, `class:active`,
  `style:color`, `use:action`, transitions, animations, and slot bindings.
- Basic JavaScript/TypeScript in `<script>` blocks, including Svelte runes such
  as `$state`, `$derived`, `$effect`, and `$props`. Event attributes such as
  `onclick={handler}` use expression highlighting.
- Basic CSS in `<style>` blocks.

All grammar includes are local; no external JS, TS, or CSS grammar is required.
The Svelte markup grammar is adapted from the official
[sveltejs/language-tools](https://github.com/sveltejs/language-tools) grammar at
commit `e7826d325d734e6be6bfd7694acc3804ea264a1e` (MIT). This is a pinned
snapshot, not a claim to track every future Svelte release. Original YAML,
converted unmodified JSON, license and exact URLs are in `vendor/svelte/`.
The embedded language rules preserve the prior bounded local rules, adapted
from the companion Vue.js Syntax plugin by Gustavo Zimbrón (MIT).
See [third-party notices](THIRD_PARTY_NOTICES.md).

## Grammar maintenance

The requested generated upstream JSON URL returned 404. The actual source is
`packages/svelte-vscode/syntaxes/svelte.tmLanguage.src.yaml` at the pinned commit.
It was converted locally with Ruby's standard YAML/JSON libraries (safe loading,
no package installation). The exact conversion command is recorded in
`vendor/svelte/provenance.json`; the original YAML is preserved unchanged.

To reproduce the shipped adaptation from the vendored converted JSON, using
only Node.js built-ins:

```sh
node scripts/adapt-svelte.mjs
npm test
```

The adapter preserves upstream Svelte markup rules, changes the root scope to
Orca's registered `text.html.svelte`, removes all selector-based injections,
and uses direct script/style embedding. Upstream `source.ts` and its fragment
includes are mapped to bounded local expression, brace, bracket and JS/TS rules.
Markdown includes become plain documentation comments. CoffeeScript, Stylus,
Sass, SCSS, Less, PostCSS and Pug injections are not shipped. Unknown external
includes fail generation rather than silently creating a dependency.

For an upstream update, review the new YAML, licenses, includes and injections;
convert it, update provenance, regenerate, and run all checks. Do not hand-edit
the generated grammar. `vendor/svelte/orca-embedded.json` is the maintained local
embedded-rule input. Reproduction from JSON needs neither Ruby nor a network.

## Development checks

With a current Node.js version (22+ recommended) and the Orca CLI:

```sh
npm test
orca plugin validate . --json
orca plugin test .
orca plugin check . --json
```

Tests are dependency-free structural and selected-regex smoke checks, **not
full TextMate tokenization tests**. Upstream Oniguruma expressions use POSIX
classes, `\\G`, possessive quantifiers, capture backreferences and variable-length
lookbehinds; these are not validated using JavaScript's different regex engine.
Tests also check byte-for-byte regeneration. CLI validation does not establish
visual highlighting correctness; no app preview is part of these checks.

For a manual preview in the running Orca app:

```sh
orca plugin dev watch .
# Open examples/Counter.svelte; inspect highlighting, then stop with Ctrl-C.
orca plugin dev unload .
```

These commands load/unload the development plugin and are not automated checks.
Colors depend on the active theme.

| File | Purpose |
| --- | --- |
| `orca-plugin.json` | Format 2 manifest; internal ID `svelte-syntax` |
| `syntaxes/svelte.tmLanguage.json` | Self-contained TextMate grammar |
| `syntaxes/language-configuration.json` | Comments and bracket/quote pairs |
| `examples/Counter.svelte` | Manual highlighting fixture, not an application |
| `tests/syntax.test.mjs` | Structural and regex smoke checks |

## Limitations

This is a bounded highlighting grammar, not a Svelte or JavaScript parser.
Only `.svelte` is registered; `.svelte.js`, `.svelte.ts`, `.js`, `.ts`, and `.css`
are unchanged. No SvelteKit routing or framework tooling is added.

Use lowercase `<script>` and `<style>` tags. Their opening attributes do not
select a separate grammar: JS and TS share basic local rules, and style blocks
always use basic CSS, even with an unsupported `lang` or `type` value.
Advanced TypeScript (including precise generic/type/destructuring tokenization),
JS regex literals and interpolation inside backtick strings are not implemented.
CoffeeScript, Stylus, Sass, SCSS, Less, PostCSS, Pug and other preprocessors have
no dedicated support. `<template lang="pug">` is treated as ordinary markup,
not Pug. Markdown in documentation comments is not tokenized. Entity-specific
highlighting from the former local grammar is not retained by the upstream
markup rules. Malformed markup and embedded closing tags can cause imperfect
coloring. Official markup rules do not make the reduced embedded grammars
feature-equivalent to the VS Code extension.

The comment shortcut inserts `<!-- -->` throughout the component; it does not
switch to JS or CSS comments inside embedded blocks. Orca's file size, line size,
and grammar time limits still apply.

## Distribution and license

Intended repository: [gzimbron/svelte-syntax-orca](https://github.com/gzimbron/svelte-syntax-orca).
The local folder name does not determine the plugin ID or repository name.
When publishing, add the `orca-plugin` repository topic and create a reviewed,
tested version tag. Catalog acceptance is a separate process.

Created by [Gustavo Zimbrón](https://github.com/gzimbron). [MIT License](LICENSE).
