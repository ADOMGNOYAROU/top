module.exports = {
  'apps/backend/src/**/*.ts': ['eslint --fix', 'prettier --write'],
  'apps/frontend/src/**/*.{ts,html}': ['eslint --fix', 'prettier --write'],
  '**/*.{json,yml,yaml}': ['prettier --write'],
  '**/*.md': ['prettier --write'],
};
