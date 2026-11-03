// Deterministic, dependency-free adaptation. Never modifies the vendored upstream files.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root = new URL('../', import.meta.url);
const read = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));

export function adapt() {
  const grammar = read('vendor/svelte/svelte.tmLanguage.json');
  const embedded = read('vendor/svelte/orca-embedded.json');
  grammar.name = 'Svelte';
  grammar.scopeName = 'text.html.svelte';
  // Orca must not depend on scope-selector injections or other plugins' grammars.
  delete grammar.injections;
  const replacements = {
    'source.ts': '#orca-expression',
    'source.ts#object-literal': '#orca-braces',
    'source.ts#object-binding-pattern': '#orca-braces',
    'source.ts#object-binding-pattern-const': '#orca-braces',
    'source.ts#array-binding-pattern': '#orca-brackets',
    'source.ts#array-binding-pattern-const': '#orca-brackets',
    'source.ts#comment': '#orca-javascript',
    'source.ts#type': '#orca-javascript',
    'source.ts#punctuation-comma': '#orca-javascript',
    'text.html.markdown': '#orca-documentation',
  };
  function rewrite(value) {
    if (!value || typeof value !== 'object') return;
    if (value.include && !value.include.startsWith('#')) {
      if (!replacements[value.include]) throw new Error(`Unmapped include: ${value.include}`);
      value.include = replacements[value.include];
    }
    Object.values(value).forEach(rewrite);
  }
  rewrite(grammar);
  // Reuse the existing bounded embedded rules, including all their local dependencies.
  for (const [key, rule] of Object.entries(embedded)) {
    function localize(value) {
      if (!value || typeof value !== 'object') return;
      if (value.include?.startsWith('#')) value.include = `#orca-${value.include.slice(1)}`;
      Object.values(value).forEach(localize);
    }
    localize(rule);
    grammar.repository[`orca-${key}`] = rule;
  }
  grammar.repository['orca-expression'] = {
    patterns: [{ include: '#orca-js-braces' }, { include: '#orca-brackets' }, { include: '#orca-javascript' }],
  };
  // These wrappers consume delimiters as the TS fragments did; expressions nest safely.
  grammar.repository['orca-braces'] = grammar.repository['orca-js-braces'];
  grammar.repository['orca-brackets'] = {
    begin: '\\[', end: '\\]', name: 'meta.brackets.js.svelte',
    patterns: [{ include: '#orca-expression' }],
  };
  // Keep @component documentation as comments, without pretending to support Markdown.
  grammar.repository['orca-documentation'] = { patterns: [] };
  // Replace the injection-dependent language container with direct, local embedding.
  // JS/TS share bounded rules; preprocessors receive only that same fallback.
  for (const tag of ['script', 'style']) {
    // Subtokenize the entire opening tag with the official attribute rules,
    // including script generics, while keeping the bounded local body wrapper.
    grammar.repository[`orca-${tag}`].beginCaptures = {
      0: { patterns: [{ include: '#tags-start-node' }, { include: '#tags-lang-start-attributes' }] },
    };
  }
  grammar.repository['tags-lang'] = {
    patterns: [{ include: '#orca-script' }, { include: '#orca-style' }],
  };
  return grammar;
}

export const render = () => `${JSON.stringify(adapt(), null, 2)}\n`;
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  writeFileSync(new URL('syntaxes/svelte.tmLanguage.json', root), render());
}
