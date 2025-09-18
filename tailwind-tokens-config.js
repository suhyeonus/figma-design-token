import { makeSdTailwindConfig } from 'sd-tailwindcss-transformer';
import StyleDictionary from 'style-dictionary';
import fs from 'fs';

// 생성된 설정을 정리하는 함수
function cleanGeneratedConfig(configObj) {
  const cleaned = {
    content: ["./src/**/*.{ts,tsx}"],
    darkMode: "class",
    theme: {
      extend: {}
    }
  };

  // theme.extend에서 유효한 속성들만 추출
  if (configObj.theme && configObj.theme.extend) {
    const extend = configObj.theme.extend;
    
    // 유효한 속성들만 복사
    const validProperties = [
      'dimension', 'spacing', 'borderRadius', 'colors', 'opacity',
      'fontFamilies', 'lineHeights', 'letterSpacing', 'paragraphSpacing',
      'fontWeights', 'fontSizes'
    ];
    
    validProperties.forEach(prop => {
      if (extend[prop] && typeof extend[prop] === 'object') {
        cleaned.theme.extend[prop] = extend[prop];
      }
    });
  }

  return cleaned;
}

// 복잡한 중첩 구조를 정리하는 함수
function flattenComplexStructure(obj, maxDepth = 3, currentDepth = 0) {
  if (currentDepth >= maxDepth || typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => flattenComplexStructure(item, maxDepth, currentDepth + 1));
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    // 복잡한 중첩 키들을 건너뛰기
    if (key.includes('youCanHaveMultipleValuesInASingleSpacingToken') ||
        key.includes('readMoreOnTheseHttpsDocs') ||
        key.includes('tokens') ||
        key.includes('studioAvailableTokens') ||
        key.includes('tokensTransformedGlobalTokens') ||
        key.includes('objectObject') ||
        key.includes('spacingMultiValue') ||
        key.match(/^\d+$/) || // 숫자로만 된 키들
        key.includes('_')) { // 언더스코어가 포함된 키들
      continue;
    }

    if (typeof value === 'object' && value !== null) {
      const flattened = flattenComplexStructure(value, maxDepth, currentDepth + 1);
      if (Object.keys(flattened).length > 0) {
        result[key] = flattened;
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

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

// 생성된 JavaScript 설정 파일을 읽고 정리
const jsContent = fs.readFileSync('tailwind.config.js', 'utf8');

// JavaScript 코드를 실행하여 객체로 변환
const configObj = eval(`(${jsContent.replace('module.exports = ', '')})`);

// 복잡한 구조를 정리
const flattenedConfig = flattenComplexStructure(configObj);

// 유효한 속성들만 추출하여 깔끔한 설정 생성
const cleanedConfig = cleanGeneratedConfig(flattenedConfig);

// TypeScript 형식으로 변환
const tsContent = `import type { Config } from 'tailwindcss';

const config: Config = ${JSON.stringify(cleanedConfig, null, 2)};

export default config;`;

fs.writeFileSync('tailwind.config.ts', tsContent);
fs.unlinkSync('tailwind.config.js');

console.log('✨  TypeScript 설정 파일 생성 완료: tailwind.config.ts');