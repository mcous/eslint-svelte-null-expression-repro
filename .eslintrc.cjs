module.exports = {
  root: true,
  plugins: ["eslint-plugin-svelte", "eslint-plugin-sonarjs"],
  parserOptions: {
    project: true,
    extraFileExtensions: [".svelte"],
    sourceType: "module",
    ecmaVersion: 2021,
  },
  rules: {
    "sonarjs/no-unused-collection": "error",
  },
  overrides: [
    {
      files: ["*.svelte"],
      parser: "svelte-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
    },
  ],
};
