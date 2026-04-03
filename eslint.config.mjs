export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    ignores: ["node_modules/**", ".next/**", "backend/**"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    }
  }
];
