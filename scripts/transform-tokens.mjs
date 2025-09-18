#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';

async function ensureDirectoryExists(directoryPath) {
  try {
    await fs.mkdir(directoryPath, { recursive: true });
  } catch (error) {
    // If mkdir fails for reasons other than existence, surface the error
    throw error;
  }
}

async function readJsonFile(filePath) {
  const fileContents = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(fileContents);
}

async function writeJsonFile(filePath, data) {
  const jsonString = JSON.stringify(data, null, 2) + '\n';
  await fs.writeFile(filePath, jsonString, 'utf-8');
}

async function splitTokens() {
  const projectRoot = path.resolve(process.cwd());
  const inputFilePath = path.join(projectRoot, 'tokens', 'tokens.json');
  const outputDir = path.join(projectRoot, 'tokens', 'transformed');

  const json = await readJsonFile(inputFilePath);

  await ensureDirectoryExists(outputDir);

  const reservedKeys = new Set(['$metadata', '$themes']);

  const topLevelKeys = Object.keys(json).filter((key) => !reservedKeys.has(key));

  if (topLevelKeys.length === 0) {
    console.warn('No top-level token sets found to split.');
    return;
  }

  for (const key of topLevelKeys) {
    const subset = json[key];
    const fileName = `${key}-tokens.json`;
    const filePath = path.join(outputDir, fileName);
    await writeJsonFile(filePath, subset);
    console.log(`Wrote ${path.relative(projectRoot, filePath)}`);
  }
}

splitTokens().catch((error) => {
  console.error('Failed to split tokens:', error);
  process.exit(1);
});


