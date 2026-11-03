<script lang="ts" generics="T extends string">
  let count = $state(0);
  let name = $state('Svelte');
  let doubled = $derived(count * 2);
  const items: string[] = ['Components', 'Runes', 'Styles'];
  const mark = (node: HTMLElement) => { node.dataset.preview = 'attached'; };
  $effect(() => { console.log(count); });
</script>

<!-- Manual highlighting fixture, not a complete application. -->
<!-- @component Manual Svelte 5 grammar preview. -->
<h1 {@attach mark}>Hello {name}!</h1>
<input bind:value={name} aria-label="Name" />
<button class:active={count > 0} onclick={() => { count += 1; }}>
  Count: {count}; doubled: {doubled}
</button>
{#if count > 0}
  <p style:color={'tomato'}>The counter is active.</p>
{:else}
  <p>Click to begin &amp; explore.</p>
{/if}
<ul>
  {#each items as item (item)}
    <li>{item}</li>
  {/each}
</ul>
{#snippet greeting(person: string)}
  <strong>Hello {person}</strong>
{/snippet}
{@render greeting(name)}

<style>
  button { color: #ff3e00; padding: 12px; }
  .active { font-weight: bold; }
</style>
