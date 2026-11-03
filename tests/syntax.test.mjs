import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { render } from '../scripts/adapt-svelte.mjs';

const text = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const json = path => JSON.parse(text(path));
const grammar = () => json('syntaxes/svelte.tmLanguage.json');
function nodes(value) {
  if (!value || typeof value !== 'object') return [];
  return [value, ...Object.values(value).flatMap(nodes)];
}
const matching = (g, scope, value) => nodes(g).some(rule => rule.name === scope &&
  (rule.match || rule.begin) && new RegExp(rule.match ?? rule.begin).test(value));

// Structural and selected ECMAScript-compatible regex smoke checks, not tokenization.
test('registers only .svelte with no runtime or permissions', () => {
  const m = json('orca-plugin.json');
  assert.equal(m.id, 'svelte-syntax');
  assert.equal(m.execution, 'data');
  assert.equal(m.manifestVersion, 2);
  assert.deepEqual(m.capabilities, []);
  assert.equal(m.repository, 'https://github.com/gzimbron/svelte-syntax-orca');
  assert.equal(json('package.json').name, 'svelte-syntax-orca');
  assert.equal(m.contributes.syntaxes.length, 1);
  const s = m.contributes.syntaxes[0];
  assert.deepEqual(s.extensions, ['.svelte']);
  assert.equal(json(s.path).scopeName, s.scopeName);
  assert.deepEqual(json(s.configuration).comments.blockComment, ['<!--', '-->']);
});

test('official source retains component docs, attachments, generics and Svelte 5 keywords', () => {
  const g = grammar();
  const all = nodes(g);
  assert.ok(all.some(r => r.contentName === 'comment.block.documentation.svelte'));
  assert.ok(all.some(r => r.begin?.includes('@attach')));
  assert.ok(all.some(r => r.begin?.includes('(generics)')));
  assert.ok(all.some(r => r.name === 'support.class.component.svelte'));
  for (const [scope, sample] of [
    ['keyword.control.svelte', 'snippet'], ['keyword.other.svelte', 'render'],
    ['storage.type.svelte', 'const'], ['keyword.control.flow.svelte', 'await'],
  ]) assert.ok(matching(g, scope, sample), sample);
  for (const sample of ['{#snippet row(item)}', '{#if visible}', '{#each items as item}'])
    assert.ok(matching(g, 'meta.special.$3.svelte meta.special.start.svelte', sample), sample);
  assert.ok(matching(g, 'meta.special.$3.svelte', '{@render row(item)}'));
});

test('grammar is self-contained, without injection-only embedded languages', () => {
  const g = grammar();
  assert.equal(g.scopeName, 'text.html.svelte');
  assert.equal(g.injections, undefined);
  for (const rule of nodes(g)) if (rule.include) {
    assert.ok(rule.include.startsWith('#'), rule.include);
    assert.ok(g.repository[rule.include.slice(1)], rule.include);
  }
  // Official Oniguruma regexes contain POSIX classes, \\G, possessive quantifiers,
  // variable-length lookbehinds and capture backreferences. Do not compile these as JS.
});

test('embedded scripts/styles and expressions preserve local JS/TS, runes and CSS', () => {
  const g = grammar();
  for (const [scope, tag, language] of [
    ['meta.embedded.block.javascript.svelte', 'script', 'javascript'],
    ['meta.embedded.block.css.svelte', 'style', 'css'],
  ]) {
    const rule = nodes(g).find(r => r.name === scope);
    assert.ok(rule, tag);
    for (const opening of [`<${tag}>`, `<${tag} lang="ts">`, `<${tag} context="module">`])
      assert.ok(new RegExp(rule.begin).test(opening), opening);
    assert.ok(!new RegExp(rule.begin).test(`<${tag}-widget>`));
    assert.ok(new RegExp(rule.end).test(`</${tag}>`));
    assert.ok(rule.patterns.some(p => p.include && g.repository[p.include.slice(1)]), language);
  }
  for (const [scope, sample] of [
    ['keyword.control.js.svelte', 'interface Props'], ['constant.numeric.js.svelte', '42'],
    ['support.function.rune.svelte', '$state.raw(0)'], ['support.function.rune.svelte', '$derived(1)'],
    ['support.function.rune.svelte', '$effect(() => {})'], ['support.function.rune.svelte', '$props()'],
    ['support.type.property-name.css.svelte', 'color: red'],
    ['constant.other.color.rgb-value.css.svelte', '#ff3e00'],
  ]) assert.ok(matching(g, scope, sample), sample);
  assert.ok(nodes(g).some(r => r.name === 'meta.braces.js.svelte'));
});

test('adaptation reproduces the distributed grammar byte for byte', () => {
  assert.equal(render(), text('syntaxes/svelte.tmLanguage.json'));
});

test('vendored source records exact pinned origin and license', () => {
  const provenance = json('vendor/svelte/provenance.json');
  assert.equal(provenance.commit, 'e7826d325d734e6be6bfd7694acc3804ea264a1e');
  assert.ok(provenance.sourceUrl.endsWith('/packages/svelte-vscode/syntaxes/svelte.tmLanguage.src.yaml'));
  assert.ok(text('vendor/svelte/LICENSE').includes('Permission is hereby granted'));
  assert.ok(text('vendor/svelte/svelte.tmLanguage.src.yaml').includes('scopeName: source.svelte'));
});

test('manual fixture covers Svelte 5 and embedded languages', () => {
  const fixture = text('examples/Counter.svelte');
  for (const value of ['<script lang="ts"', '$state', '$derived', '{#if', '{:else}', '{/if}',
    '{#each', '{/each}', 'bind:value', 'class:active', 'onclick=', '<style>',
    '{#snippet', '{@render', '{@attach', 'generics=']) assert.ok(fixture.includes(value), value);
});
