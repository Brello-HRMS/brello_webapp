# Brello - Project Guidelines

Welcome to the Brello codebase! Please follow these guidelines to ensure consistency and maintainability.

## 📁 Folder Structure

We follow a feature-based architecture:

- **`src/app`**: Global app setup (providers, root component, entry point).
- **`src/assets`**: Static assets (images, fonts) and global styles.
- **`src/components`**: Shared UI components (dumb components).
  - `ui/`: Atoms (Button, Input).
  - `layout/`: Structural components (Header, Footer).
- **`src/features`**: Domain-specific logic. Each feature folder should contain its own `api`, `components`, `hooks`, and `types`.
- **`src/pages`**: Route components (should be minimal, composing features).
- **`src/routes`**: Routing configuration.
- **`src/config`**: Environment variables and constants.

## 🎨 Styling

We use **SCSS Modules** for styling.

### 1. SCSS Modules

- Name style files as `Component.module.scss`.
- Import them as `styles` in your component:

  ```typescript
  import styles from './Component.module.scss';

  <div className={styles.container}>...</div>
  ```

- **Do not** use inline styles or utility classes (e.g., Tailwind) unless absolutely necessary for dynamic values.

### 2. Global Variables

- Variables for colors, typography, spacing, and layout are defined in `src/assets/styles/_variables.scss`.
- **Naming**: Use `$kebab-case` (e.g., `$color-primary`, `$spacing-4`).

### 3. Automatic Injection

- **Do not** import `_variables.scss` manually in your module files.
- It is automatically injected into every SCSS file via Vite configuration.
- You can directly use variables:
  ```scss
  .my-class {
    color: $color-primary; // Works automatically!
    padding: $spacing-4;
  }
  ```

## 📝 Naming Conventions

- **Components**: `PascalCase` (e.g., `UserProfile.tsx`).
- **Hooks**: `camelCase` starting with `use` (e.g., `useAuth.ts`).
- **Utilities/Functions**: `camelCase` (e.g., `formatDate.ts`).
- **SCSS Classes**: `camelCase` or `kebab-case` (be consistent within the file).

## � Git Workflow

- **Branch Naming**:
  - `feature/feature-name` (e.g., `feature/user-auth`)
  - `fix/bug-description` (e.g., `fix/login-error`)
  - `refactor/scope` (e.g., `refactor/folder-structure`)
- **Commit Messages**: Use Conventional Commits.
  - `feat: add login page`
  - `fix: resolve crash on startup`
  - `style: update primary color`
  - `docs: update contributing guidelines`

## 🧠 State Management

- **Local State**: Use `useState` for component-specific UI state (e.g., modal open/close).
- **Server State**: Use `React Query` (via `src/lib/react-query.ts` - proposed) for API data caching.
- **Global State**: Use `Context API` or `Zustand` (if complex) for app-wide state (e.g., Theme, Auth user). Avoid overusing global state.

## 🌐 API Handling

- **Axios Instance**: Always use the configured instance from `src/lib/axios.ts`.
- **Feature-based API**: Define API calls within the feature folder (`src/features/auth/api/authApi.ts`).
- **Error Handling**: Handle errors gracefully, utilizing the global interceptors in `axios.ts` or local try/catch blocks for UI feedback.

## 🧪 Testing

- **Unit Tests**: Write tests for utilities and complex logic using Vitest.
  - Co-locate tests with the file: `src/utils/formatDate.spec.ts`.
- **Component Tests**: Test shared components for rendering and interaction.
