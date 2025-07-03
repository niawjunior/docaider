---
trigger: always_on
---

# 🎙️ Docaider Code Style Guide

This guide ensures consistent development standards across the Docaider project, fostering maintainability, scalability, and a clean developer experience.

---

## 🔧 General Code Style & Formatting

- Use **descriptive variable and function names** (e.g., `generatePodcastScript` instead of `genScript`).
- Format code using **Prettier** and **ESLint**.
- Keep functions short and **single-responsibility**.
- Remove unused variables, imports, and commented-out code regularly.

---

## 📁 Project Structure & Architecture

- Follow **Next.js App Router** conventions using the `/app` directory.
- Store:
  - **Pages/Routes** → `/app`
  - **Reusable Components** → `/components`
  - **API Routes** → `/app/api/`
- Maintain a **modular structure** — group related logic together.

---

## 🧩 Component Structure

- Use **TypeScript** for all files.
- Component files must be named in **PascalCase** (e.g., `Home.tsx`).
- Add `"use client"` at the top of client components.
- Prefer **functional components** with React Hooks.
- Keep components **focused** — if a component grows too large (e.g., over 200–300 lines or mixes responsibilities), **split it into smaller subcomponents**.

---

## 🎨 Styling & UI

- Use **Tailwind CSS** for all styling.
- Use **`shadcn/ui`** components located in `/components/ui`.
- When adding new shadcn components, **install via CLI properly**.
- Maintain consistent spacing, padding, and font sizes using **Tailwind's design scale**.
- Use **responsive utilities** to ensure mobile-friendly designs.

---

## ⚛️ State Management

- For local state, use **`useState`** and **`useEffect`**.

---

## ❌ Error Handling

- Wrap async/await in `try/catch`.
- Log errors with **contextual information** for debugging.
- Display **user-friendly messages** — never expose raw error dumps.
- Handle edge cases such as empty states, timeouts, and fallback UIs.

---

## 🚀 Performance Optimization

- Use `next/image` for optimized images.
- Add **skeletons/loading indicators** for async content.
- Use **pagination** and **lazy loading** where applicable.
- Optimize **search and filter** logic to avoid expensive re-renders.

---

## ♿ Accessibility

- Use **semantic HTML** (e.g., `<button>`, `<nav>`, `<main>`).
- Add **ARIA attributes** where appropriate.
- Ensure proper **keyboard navigation**.
- Maintain **adequate contrast ratios** for readability.

---

## 📚 Documentation

- Add **inline comments** for complex or non-obvious logic.
- Document props via **TypeScript interfaces**.
- Keep the `README.md` up-to-date with:
  - Setup instructions
  - Environment variables
  - Development tips
- Maintain API docs (e.g., with OpenAPI or Markdown-based docs).

---

## ⚙️ Implementation Workflow

When implementing new features or edit/write a files:
You Must

1. **Start with a detailed task list** in a markdown file (e.g., `feature-[name].md`)
2. **Break down** features into clear, manageable subtasks.
3. Check off tasks as completed ✅ and document:
   - Summary of changes
   - Any issues encountered

### 📋 Task List Template

#### Initial List

## Feature: Social Post Management

- [ ] Create database schema for social posts
- [ ] Implement API endpoint for saving posts
- [ ] Add UI components for post creation
- [ ] Implement post listing in dashboard
- [ ] Add edit functionality for existing posts
- [ ] Implement search and filtering

## Feature: Social Post Management

- [✅] Create database schema for social posts
- [✅] Implement API endpoint for saving posts
- [✅] Add UI components for post creation
- [ ] Implement post listing in dashboard
- [ ] Add edit functionality for existing posts
- [ ] Implement search and filtering
