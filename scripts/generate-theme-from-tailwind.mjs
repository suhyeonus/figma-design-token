#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import os from 'node:os';

const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const tailwindConfigPath = path.resolve(projectRoot, 'tailwind.config.ts');
const globalsCssPath = path.resolve(projectRoot, 'app', 'globals.css');

async function readTailwindConfigColors() {
  if (!fs.existsSync(tailwindConfigPath)) {
    throw new Error(`Cannot find tailwind.config.ts at ${tailwindConfigPath}`);
  }
  
  let config;
  try {
    const source = fs.readFileSync(tailwindConfigPath, 'utf8');
    
    const jsSource = source
      .replace(/\/\*\* @type \{import\('tailwindcss'\)\.Config\} \*\//g, '')
      .replace(/import type { Config } from 'tailwindcss';/g, '')
      .replace(/const config: Config = {/g, 'const config = {')
      .replace(/export default config;/g, 'module.exports = config;');
      
    const tempPath = path.join(os.tmpdir(), `tailwind.config.${Date.now()}.cjs`);
    fs.writeFileSync(tempPath, jsSource, 'utf8');
    
    try {
      const require = createRequire(import.meta.url);
      config = require(tempPath);
    } finally {
      try { fs.unlinkSync(tempPath); } catch {}
    }
  } catch (e) {
    console.error('Error reading tailwind config:', e.message);
    throw new Error(`Failed to read tailwind.config.ts: ${e.message}`);
  }
  
  const colors = config?.theme?.extend?.colors;
  if (!colors || typeof colors !== 'object') {
    console.warn('No colors found in tailwind config theme.extend.colors');
    return {};
  }
  return colors;
}

function flattenColorsToCssVars(prefix, obj) {
  const result = {};
  function walk(currentKeyParts, value) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const [k, v] of Object.entries(value)) {
        walk([...currentKeyParts, String(k)], v);
      }
    } else if (typeof value === 'string') {
      const varName = `--color-${currentKeyParts.join('-')}`;
      result[varName] = value;
    }
  }
  walk([prefix].filter(Boolean), obj);
  return result;
}

function generateCssVarsBlock(vars) {
  const lines = Object.entries(vars)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, val]) => `  ${name}: ${val};`);
  return lines.join('\n');
}

function injectIntoGlobalsCss(cssPath, newVarsCss) {
  if (!fs.existsSync(cssPath)) {
    throw new Error(`Cannot find globals.css at ${cssPath}`);
  }
  const startMarker = '/* AUTO-GENERATED COLORS START */';
  const endMarker = '/* AUTO-GENERATED COLORS END */';
  let content = fs.readFileSync(cssPath, 'utf8');

  // Ensure @theme inline block exists
  const themeStartIdx = content.indexOf('@theme inline');
  if (themeStartIdx === -1) {
    // Insert a minimal @theme inline block after :root block or at end of file
    const rootEndMatch = content.match(/\:root\s*\{[\s\S]*?\}\s*/);
    const insertIdx = rootEndMatch ? content.indexOf(rootEndMatch[0]) + rootEndMatch[0].length : content.length;
    const block = `\n@theme inline {\n${startMarker}\n${newVarsCss}\n${endMarker}\n}\n`;
    content = content.slice(0, insertIdx) + block + content.slice(insertIdx);
    fs.writeFileSync(cssPath, content, 'utf8');
    return;
  }

  // Find the braces of @theme inline block
  const braceOpenIdx = content.indexOf('{', themeStartIdx);
  if (braceOpenIdx === -1) {
    throw new Error('Malformed @theme inline block: missing opening brace');
  }
  let depth = 1;
  let i = braceOpenIdx + 1;
  while (i < content.length && depth > 0) {
    const ch = content[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    i++;
  }
  if (depth !== 0) {
    throw new Error('Malformed @theme inline block: missing closing brace');
  }
  const themeBlockEndIdx = i - 1;

  const before = content.slice(0, braceOpenIdx + 1);
  const inside = content.slice(braceOpenIdx + 1, themeBlockEndIdx);
  const after = content.slice(themeBlockEndIdx);

  const startIdx = inside.indexOf(startMarker);
  const endIdx = inside.indexOf(endMarker);

  let newInside;
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    // Replace existing block
    const beforeMarkers = inside.slice(0, startIdx);
    const afterMarkers = inside.slice(endIdx + endMarker.length);
    const replacement = `\n${startMarker}\n${newVarsCss}\n${endMarker}\n`;
    newInside = beforeMarkers + replacement + afterMarkers;
  } else {
    // Insert new block at the top of the @theme inline content
    const insertion = `\n${startMarker}\n${newVarsCss}\n${endMarker}\n`;
    newInside = insertion + inside;
  }

  const newContent = before + newInside + after;
  fs.writeFileSync(cssPath, newContent, 'utf8');
}

async function main() {
  const colors = await readTailwindConfigColors();
  const vars = flattenColorsToCssVars('', colors);
  const css = generateCssVarsBlock(vars);
  injectIntoGlobalsCss(globalsCssPath, css);
  // eslint-disable-next-line no-console
  console.log(`Injected ${Object.keys(vars).length} color variables into app/globals.css`);
}

main();
