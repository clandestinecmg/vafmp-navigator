import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import prettier from 'eslint-plugin-prettier';

export default tseslint.config(
  { ignores: ["node_modules", "snapshots", "snapshots/**", "snapshot", "snapshot/**"] },
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:react/recommended",
      "plugin:prettier/recommended"
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      project: "./tsconfig.json",
      tsconfigRootDir: import.meta.dirname
    },
    rules: {
      "prettier/prettier": "error"
    }
  }
);
