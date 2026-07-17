# Database tools

These scripts use `DATABASE_URL` and `DATABASE_SSL` from the repository root
`.env` file.

```bash
npm install --prefix tools/database
npm run check --prefix tools/database
npm run test --prefix tools/database
```

`npm run seed --prefix tools/database` is destructive: it drops all application
tables, recreates the schema, and inserts demo data. Do not run it against
production unless resetting the database is intentional.

## Additive migrations

For an existing database (without wiping data), apply SQL files under
`migrations/` in order:

```bash
npm run migrate --prefix tools/database
```

`001_add_results_published.sql` adds `exams.results_published` so teachers can
grade privately and publish results later.
