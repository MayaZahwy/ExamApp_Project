# Diagrams

This folder contains system diagrams for the Exam Management System.

## Files

- `architecture.mmd`: Mermaid architecture diagram (frontend, services, API, storage).
- `erd.mmd`: Mermaid ERD aligned with `docs/api-contract.md`.
- `components-hierarchy.txt`: existing text-based component hierarchy notes.
- `entities.txt`: existing text-based entity notes.
- `uml-services.txt`: existing text-based service notes.
- `use-case-diagram.txt`: existing text-based use-case notes.

## Rendering Mermaid

You can render `.mmd` files using:

- Mermaid Live Editor
- Markdown tools/extensions that support Mermaid
- Git hosting platforms with Mermaid rendering support

These diagrams are intentionally source-based (`.mmd`) so they are easy to review and update in pull requests.

## Additional diagrams

- `oop-class-diagram.mmd`: Frontend OOP class diagram (Mermaid `classDiagram`). Includes only `class` declarations under `client/src`. Backend Express modules are not classes and are omitted.
- `sequence-login-jwt.mmd`: Sequence diagram — login and JWT authentication (API mode).
- `sequence-create-publish-exam.mmd`: Sequence diagram — lecturer creates an exam and publishes it (API mode).
- `sequence-submit-grade-publish.mmd`: Sequence diagram — student submits, lecturer grades, results are published (API mode).
