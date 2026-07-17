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
