# Flowmate

A modern Angular 21 application built with signals, standalone components, and best-in-class tooling.

## Tech Stack

| Category         | Technology             |
| ---------------- | ---------------------- |
| Framework        | Angular 21             |
| UI Components    | Angular Material 21    |
| Styling          | Tailwind CSS 4         |
| State Management | NgRx SignalStore       |
| Testing          | Vitest + jsdom         |
| Linting          | ESLint 9 (flat config) |
| Formatting       | Prettier               |
| Git Hooks        | Husky + lint-staged    |

## Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher

## Getting Started

```bash
# Clone the repository
git clone <repository-url>
cd flowmate

# Install dependencies
npm install

# Start development server
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

## Available Scripts

### Development

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm start`     | Start dev server at `localhost:4200` |
| `npm run watch` | Build in watch mode                  |

### Build

| Command              | Description                  |
| -------------------- | ---------------------------- |
| `npm run build`      | Development build            |
| `npm run build:prod` | Production build (optimized) |

### Testing

| Command                 | Description                    |
| ----------------------- | ------------------------------ |
| `npm test`              | Run tests once                 |
| `npm run test:watch`    | Run tests in watch mode        |
| `npm run test:coverage` | Run tests with coverage report |

### Code Quality

| Command                | Description             |
| ---------------------- | ----------------------- |
| `npm run lint`         | Check for lint errors   |
| `npm run lint:fix`     | Auto-fix lint errors    |
| `npm run format`       | Format all source files |
| `npm run format:check` | Check formatting (CI)   |

### Composite Scripts

| Command                | Description                           |
| ---------------------- | ------------------------------------- |
| `npm run validate`     | Run lint + test in parallel           |
| `npm run validate:fix` | Fix lint errors + format              |
| `npm run ci`           | Full CI pipeline: lint → test → build |

## Project Structure

```
flowmate/
├── src/
│   ├── app/
│   │   ├── core/           # Singleton services, guards, interceptors
│   │   ├── shared/         # Reusable components, pipes, directives
│   │   ├── features/       # Feature modules (lazy-loaded)
│   │   ├── app.ts          # Root component
│   │   ├── app.config.ts   # Application configuration
│   │   └── app.routes.ts   # Root routes
│   ├── environments/       # Environment configurations
│   ├── styles.css          # Global styles
│   └── main.ts             # Application entry point
├── .husky/                 # Git hooks
├── eslint.config.js        # ESLint configuration (flat config)
├── tsconfig.json           # TypeScript configuration
└── angular.json            # Angular CLI configuration
```

## Path Aliases

Clean imports using TypeScript path aliases:

```typescript
// Instead of
import { UserService } from '../../../core/services/user.service';

// Use
import { UserService } from '@core/services/user.service';
```

| Alias       | Path                 |
| ----------- | -------------------- |
| `@app/*`    | `src/app/*`          |
| `@core/*`   | `src/app/core/*`     |
| `@shared/*` | `src/app/shared/*`   |
| `@env/*`    | `src/environments/*` |

## Code Quality

### Pre-commit Hooks

Husky runs lint-staged on every commit:

- **TypeScript files**: ESLint fix + Prettier
- **HTML files**: ESLint fix + Prettier
- **CSS/SCSS files**: Prettier
- **JSON/Markdown files**: Prettier

### ESLint Configuration

Strict Angular + TypeScript rules:

- Type-aware linting enabled
- OnPush change detection enforced
- Strict template checking
- Accessibility rules (a11y)

### TypeScript Configuration

Maximum type safety:

- `strict: true` with all sub-options
- `noUncheckedIndexedAccess` — array access may be undefined
- `exactOptionalPropertyTypes` — stricter optional types
- `verbatimModuleSyntax` — explicit type imports

## Angular Conventions

### Components

```typescript
@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent {
  // Use signals for state
  private readonly count = signal(0);

  // Use computed for derived state
  protected readonly doubled = computed(() => this.count() * 2);

  // Use input() and output() functions
  readonly data = input.required<Data>();
  readonly selected = output<Item>();
}
```

### Services

```typescript
@Injectable({ providedIn: 'root' })
export class ExampleService {
  private readonly http = inject(HttpClient);

  getData(): Observable<Data[]> {
    return this.http.get<Data[]>('/api/data');
  }
}
```

### State Management (NgRx SignalStore)

```typescript
export const CounterStore = signalStore(
  withState({ count: 0 }),
  withComputed(({ count }) => ({
    doubled: computed(() => count() * 2),
  })),
  withMethods((store) => ({
    increment(): void {
      patchState(store, { count: store.count() + 1 });
    },
  }))
);
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run `npm run validate` to ensure quality
4. Commit (pre-commit hooks will run automatically)
5. Open a pull request

## License

Private — All rights reserved.
