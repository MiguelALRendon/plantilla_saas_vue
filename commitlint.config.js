/**
 * Commitlint configuration
 * Enforces structured commit messages per §6.6 Git — Commits standard.
 *
 * REQUIRED FORMAT: type(scope): description
 *
 * Examples:
 *   feat(entities): add Customer BaseEntity class
 *   fix(ui): correct sidebar toggle on mobile
 *   refactor(decorators): rename @ApiEndpoint to @api_endpoint
 *   docs(spec): update data-model with Order entity
 *   chore(config): add commitlint configuration
 *
 * Install dependencies to activate:
 *   npm install --save-dev @commitlint/cli @commitlint/config-conventional
 *   npm install --save-dev husky
 *   npx husky init
 *   echo "npx --no commitlint --edit \$1" > .husky/commit-msg
 *
 * @see /copilot/06-CODE-STYLING-STANDARDS.md §6.6
 */

/** @type {import('@commitlint/types').UserConfig} */
export default {
    extends: ['@commitlint/config-conventional'],
    rules: {
        /** Enforce English-only commit messages */
        'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],

        /** Allowed commit types per §6.6 */
        'type-enum': [
            2,
            'always',
            [
                'feat',     // New feature
                'fix',      // Bug fix
                'refactor', // Code restructure (no behavior change)
                'docs',     // Documentation only
                'test',     // Adding or updating tests
                'chore',    // Build/tooling/config changes
                'style',    // Formatting only (no logic change)
                'perf',     // Performance improvement
                'ci',       // CI/CD pipeline changes
                'revert',   // Revert a previous commit
            ],
        ],

        /** Scope is required — must reference a framework layer or module area */
        'scope-empty': [2, 'never'],

        /** Subject must have content after type(scope): */
        'subject-empty': [2, 'never'],

        /** Subject min length */
        'subject-min-length': [2, 'always', 10],

        /** Subject max length (summary line) */
        'header-max-length': [2, 'always', 100],
    },
};
