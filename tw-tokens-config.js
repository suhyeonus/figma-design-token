import { makeSdTailwindConfig } from 'sd-tailwindcss-transformer';
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary(
  makeSdTailwindConfig({
    type: 'all',
    source: ['./tokens/sd-tokens.json'], 
    buildPath: '',
  }),
);

await sd.hasInitialized;
await sd.buildAllPlatforms();