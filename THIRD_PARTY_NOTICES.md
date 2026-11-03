# Third-party notices

## Official Svelte grammar — MIT

The Svelte markup rules in `syntaxes/svelte.tmLanguage.json` are adapted from
`sveltejs/language-tools`, commit
`e7826d325d734e6be6bfd7694acc3804ea264a1e`, source file
`packages/svelte-vscode/syntaxes/svelte.tmLanguage.src.yaml`.

Copyright (c) 2020-Present [these people](https://github.com/sveltejs/language-tools/graphs/contributors).

The full upstream MIT notice is retained in [vendor/svelte/LICENSE](vendor/svelte/LICENSE).
Original YAML and its unmodified JSON conversion are retained alongside it;
[provenance](vendor/svelte/provenance.json) records exact source and license URLs.
Changes: local root scope, removed external injections, direct script/style
embedding, local JS/TS fragment fallbacks, and plain-comment Markdown fallback.
These changes are reproducible with `node scripts/adapt-svelte.mjs`.

## TypeScript-TmLanguage — MIT

The upstream YAML credits Microsoft TypeScript-TmLanguage for its
`type-parameters` rules. That attribution remains in the preserved YAML.
Copyright (c) Microsoft Corporation. All rights reserved.
The full notice is retained in
[vendor/svelte/TypeScript-TmLanguage-LICENSE.txt](vendor/svelte/TypeScript-TmLanguage-LICENSE.txt).
Only the license was retrieved from that repository; no external TS grammar
is bundled or required. Its source URL is recorded in provenance.

## Local embedded rules — MIT

`vendor/svelte/orca-embedded.json` preserves the prior local JS/TS/CSS rules,
adapted from the companion Vue.js Syntax plugin by Gustavo Zimbrón under MIT.
They remain covered by this project's [MIT license](LICENSE).
