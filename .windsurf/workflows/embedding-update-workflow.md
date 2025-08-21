---
description: How to update embedding feature documentation
---

# Embedding Feature Documentation Update Workflow

This workflow ensures that all documentation related to the embedding feature is kept up-to-date when changes are made to the feature.

## When to Use This Workflow

- After making changes to the embedded chatbox functionality
- After modifying the EmbedDialog component
- After updating the embed API endpoints
- After changing the embedding configuration options

## Steps

1. Update the main documentation file:
```bash
code /docs/embedding.md
```

2. Update the test checklist if needed:
```bash
code /docs/embedding-test-checklist.md
```

3. Ensure the README.md mentions the embedding feature:
```bash
code /README.md
```

4. Update the test-embed.html file if the embed script parameters have changed:
```bash
code /public/test-embed.html
```

5. Run manual tests using the test checklist:
```bash
npm run dev
```
Then navigate to http://localhost:3000/test-embed.html

6. Update the locale files with any new strings:
```bash
code /messages/en.json
code /messages/th.json
```

7. Commit the changes:
```bash
git add .
git commit -m "docs: update embedding feature documentation"
```
