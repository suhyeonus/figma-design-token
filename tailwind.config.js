/**
 * Wrapper Tailwind config that consumes the auto-generated tokens config.
 * Do NOT edit tokens/tailwind.config.js directly since it is regenerated.
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);
// tokens/tailwind.config.js is CommonJS (module.exports). Load via require.
const tokensConfig = require("./tokens/tailwind.config.js");

/** @type {import('tailwindcss').Config} */
const config = {
  // Prefer values from the tokens config, but ensure correct content paths for this app
  ...tokensConfig,
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;


