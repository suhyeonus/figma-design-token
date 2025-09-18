#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const globalsCssPath = path.resolve(projectRoot, 'app', 'globals.css');
const globalTokensPath = path.resolve(projectRoot, 'tokens', 'transformed', 'global-tokens.json');
const darkTokensPath = path.resolve(projectRoot, 'tokens', 'transformed', 'dark-tokens.json');

function readJsonSafe(filePath) {
  try {
    if (!fs.existsSync(filePath)) return {};
    const raw = fs.readFileSync(filePath, 'utf8');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function isTokenLeaf(node) {
  return node && typeof node === 'object' && 'value' in node && Object.keys(node).every((k) => ['value', 'type', 'description'].includes(k));
}

function flattenTokensToCssVars(obj, options = {}) {
  const { prefix = '', excludeKeys = new Set(['$metadata', '$themes']) } = options;
  const vars = {};
  function walk(node, pathParts) {
    if (!node || typeof node !== 'object') return;

    if (isTokenLeaf(node)) {
      const varName = `--${[...pathParts].join('-')}`;
      vars[varName] = String(node.value);
      return;
    }

    for (const [key, value] of Object.entries(node)) {
      if (excludeKeys.has(key)) continue;
      walk(value, [...pathParts, key]);
    }
  }
  walk(obj, prefix ? [prefix] : []);
  return vars;
}

function buildVarsBlock(varsMap) {
  return Object.entries(varsMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, val]) => `    ${name}: ${val};`)
    .join('\n');
}

function buildGlobalsCss({ rootVarsCss, darkVarsCss }) {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  font-size: 14px !important;
}

body {
  font-family: var(--font-spoqa-han-sans), sans-serif;
}

body #custom-gradient {
  background: linear-gradient(to top, var(--gradient-bg-from) 80%, var(--gradient-bg-to));
}

body #custom-inner-gradient {
  background: linear-gradient(180deg, var(--inner-gradient-bg-from) 0%, var(--inner-gradient-bg-center) 70%, var(--inner-gradient-bg-to) 100%);
}

body .cm-editor {
  font-family: var(--font-spoqa-han-sans), sans-serif;
  background-color: transparent;
}

body .cm-focused {
  outline: none !important;
  box-shadow: none !important;
}

body span.token {
  color: rgb(var(--support-default-info));
  font-weight: 400;
}

body span.token.string {
  color: rgb(var(--support-default-success));
}

body span.token.number {
  color: rgb(var(--support-default-caution));
}

body span.token.boolean {
  color: rgb(var(--support-default-caution));
}

body span.token.comment {
  color: rgb(var(--grays-gray3));
}

body span.token.punctuation {
  color: rgb(var(--texts-secondary));
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox  */
input[type='number'] {
  -moz-appearance: textfield;
}

::-webkit-scrollbar {
  width: 0.45rem;
  height: 0.45rem;
  transition: all 0.35 ease;
  -webkit-transition: all 0.35 ease;
  -moz-transition: all 0.35 ease;
  -ms-transition: all 0.35 ease;
  -o-transition: all 0.35 ease;
}

::-webkit-scrollbar-track {
  background-color: transparent;
}

::-webkit-scrollbar-corner {
  background-color: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgb(var(--grays-gray5));
  border-radius: 1rem;
  -webkit-border-radius: 1rem;
  -moz-border-radius: 1rem;
  -ms-border-radius: 1rem;
  -o-border-radius: 1rem;
}

::-webkit-scrollbar-thumb:hover {
  background: rgb(var(--grays-gray4));
}

::-webkit-scrollbar-button {
  display: none;
}

@layer base {
  :root {
${rootVarsCss}
  }
  .dark {
${darkVarsCss}
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background-primary text-foreground;
  }
}
`;
}

function main() {
  const globalTokens = readJsonSafe(globalTokensPath);
  const darkTokens = readJsonSafe(darkTokensPath);

  const rootVars = flattenTokensToCssVars(globalTokens);
  const darkVars = Object.keys(darkTokens).length ? flattenTokensToCssVars(darkTokens) : {};

  const rootVarsCss = buildVarsBlock(rootVars);
  const darkVarsCss = buildVarsBlock(darkVars);

  const css = buildGlobalsCss({ rootVarsCss, darkVarsCss });
  fs.writeFileSync(globalsCssPath, css, 'utf8');
  // eslint-disable-next-line no-console
  console.log(`Generated app/globals.css using ${Object.keys(rootVars).length} :root vars and ${Object.keys(darkVars).length} dark vars from tokens.`);
}

main();
