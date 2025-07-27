---
description: Automatically update English and Thai locale files after implementing new features
---

---

## description: Automatically update English and Thai locale files after implementing new features

# Auto Locale Update Workflow

This workflow helps maintain consistent translations by:

1. Identifying new text that needs translation
2. Updating both English (en) and Thai (th) locale files
3. Ensuring proper i18n key structure and formatting

## Steps to Use

1. After implementing a new feature or UI change, run `/auto-locale` in Cascade
2. Provide the component or page name where new text was added
3. The workflow will analyze the changes and guide you through the translation process

## Workflow Steps

1. **Identify New Text**

   - Scan the specified component/page for hardcoded text
   - Extract text that needs to be moved to locale files
   - Generate i18n keys following the project's naming convention

2. **Update English Locale (en)**

   - Add new keys with English translations
   - Preserve existing translations
   - Format the JSON file properly

3. **Update Thai Locale (th)**

   - Add new keys with placeholder Thai translations
   - Mark placeholders with `[TODO]` for manual translation
   - Preserve existing translations

4. **Replace Hardcoded Text**

   - Replace hardcoded text with i18n function calls
   - Ensure proper interpolation for dynamic values

5. **Verification**
   - Check for any remaining hardcoded text
   - Verify all placeholders are properly marked
   - Ensure consistent formatting

## Best Practices

- Keep translations in separate files by feature/domain
- Use descriptive, hierarchical keys (e.g., `chat.sendButton.label`)
- Include comments for context when needed
- Keep translations in sync with the design system
- Review Thai translations with native speakers when possible

## Example

For a new chat send button:

```typescript
// Before
<Button>Send Message</Button>

// After
<Button>{t('chat.sendButton.label')}</Button>

// en/chat.json
{
  "sendButton": {
    "label": "Send Message"
  }
}

// th/chat.json
{
  "sendButton": {
    "label": "[TODO] ส่งข้อความ"
  }
}
```
