module.exports = {
  'apps/backend/src/**/*.ts': [
    'eslint --fix --config apps/backend/eslint.config.mjs',
    'prettier --write',
  ],
  'apps/frontend/src/**/*.{ts,html}': [
    'eslint --fix --config apps/frontend/eslint.config.mjs',
    'prettier --write',
  ],
  '**/*.{json,yml,yaml}': ['prettier --write'],
  '**/*.md': ['prettier --write'],
};
