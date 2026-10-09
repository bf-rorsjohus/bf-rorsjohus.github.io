import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
  {
    ignores: ['dist/', '.astro/', 'node_modules/', 'src/content/', 'src/assets/drive/', 'public/'],
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.tsx'],
    plugins: { react, 'jsx-a11y': jsxA11y },
    settings: { react: { version: 'detect' } },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      'react/jsx-key': 'error',
      // Components render on the server only; hooks with effects would never run.
      // Client behaviour lives in src/scripts/ (vanilla TS), never in components.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              importNames: ['useEffect', 'useState', 'useLayoutEffect'],
              message: 'Components are server-rendered only; no client state or effects.',
            },
          ],
        },
      ],
    },
  },
);
