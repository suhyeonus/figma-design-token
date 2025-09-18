import { makeSdTailwindConfig } from 'sd-tailwindcss-transformer';
import StyleDictionary from 'style-dictionary';
import fs from 'fs';

const originalLog = console.log;
console.log = () => {};

const sd = new StyleDictionary(
  makeSdTailwindConfig({
    type: 'all',
    source: ['./tokens/sd-tokens.json'], 
    buildPath: '',
  }),
);

await sd.hasInitialized;
await sd.buildAllPlatforms();

console.log = originalLog;

const jsContent = fs.readFileSync('tailwind.config.js', 'utf8');
let tsContent = jsContent
  .replace('module.exports = {', 'import type { Config } from \'tailwindcss\';\n\nconst config: Config = {');

if (tsContent.trimEnd().endsWith('}')) {
  tsContent = tsContent.trimEnd().slice(0, -1) + '};\n\nexport default config;';
}

fs.writeFileSync('tailwind.config.ts', tsContent);
fs.unlinkSync('tailwind.config.js');

console.log('✨  TypeScript 설정 파일 생성 완료: tailwind.config.ts');