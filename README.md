# Flowmate - Smart Task Board with Angular Signals

A modern Kanban board application built as a **KPI learning project** to demonstrate Angular 21+ modern concepts including Standalone Components, Signals, and performance optimization techniques.

## 📚 KPI Learning Objectives

This project was developed to achieve the following learning goals:

### Learning Goals

- ✅ **Angular 19+ Standalone Components**: All components are standalone, eliminating NgModules
- ✅ **Signal-based Reactivity**: Comprehensive use of Signals for state management instead of RxJS observables
- ✅ **Change Detection Optimization**: OnPush strategy implemented across all components
- ✅ **Lazy Loading**: Feature-based lazy loading demonstrated through route configuration
- ✅ **RxJS Best Practices**: Minimal RxJS usage, preferring Signals for state management
- ✅ **API Integration Patterns**: Service-based architecture ready for backend integration

### Concepts Learned and Applied

#### 1. **Standalone Components**

- All components use standalone architecture (no NgModules)
- Components import only what they need
- Simplified dependency management with `imports` array
- Example: `KanbanBoardComponent`, `KanbanCardComponent`, etc.

#### 2. **Angular Signals**

- **State Management**: `signal()` for mutable state (columns, tasks, filters)
- **Computed Values**: `computed()` for derived state (filtered columns, assignee options)
- **Effects**: `effect()` for side effects and initialization
- **Reactive Updates**: Automatic change detection when signals change

**Key Implementation:**

```typescript
// Service with Signals
private readonly columnsSignal = signal<KanbanColumn[]>([]);
readonly columns = computed(() => {
  // Derived state with filtering logic
  return this.columnsSignal().map(column => ({
    ...column,
    tasks: column.tasks.filter(/* filter logic */)
  }));
});
```

#### 3. **Modern Input/Output API**

- Using `input()` and `output()` functions instead of decorators
- Type-safe inputs with `input.required<T>()`
- Signal-based inputs for reactive updates

#### 4. **Performance Optimization**

- **OnPush Change Detection**: All components use `ChangeDetectionStrategy.OnPush`
- **Computed Signals**: Expensive calculations cached automatically
- **Lazy Loading**: Kanban feature loaded lazily via route configuration
- **NgOptimizedImage**: Image optimization for better performance

#### 5. **Modern Template Syntax**

- Native control flow: `@if`, `@for`, `@switch` instead of structural directives
- Signal-based bindings: `{{ signal() }}` instead of observables
- Template reference variables with `viewChild()`

## 🚀 Features

### Core Functionality

- **Kanban Board**: Visual task management with customizable columns
- **Drag & Drop**: Intuitive drag-and-drop for tasks and columns
- **Task Management**: Create, edit, and delete tasks with rich metadata
- **Assignee Filtering**: Filter tasks by assignee with visual avatar indicators
- **Task Details Dialog**: Comprehensive task details with inline editing
- **Local Storage**: Data stored locally using Angular services (no backend required)

### Task Features

- Task titles and descriptions
- Priority levels (High, Medium, Low)
- Tags with color coding
- Due dates
- Assignee assignment with avatars
- Custom fields support
- Ticket IDs

### UI/UX Features

- Modern, responsive design with Tailwind CSS
- Angular Material components for consistent UI
- Smooth animations and transitions
- Inline editing for task properties
- Visual feedback for drag operations
- Accessible components with proper ARIA labels

## 🛠️ Tech Stack

- **Framework**: Angular 21
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Angular Material 21
- **State Management**: Angular Signals (no RxJS for state)
- **Build Tool**: Angular Build (esbuild)
- **Linting**: ESLint with Angular ESLint
- **Testing**: Vitest with Playwright

## 📋 Prerequisites

- Node.js 18+ and npm 11.6.2+
- Angular CLI 21+

## 🏃 Getting Started

### Installation

1. Clone the repository:

```bash
git clone https://github.com/hariompande/flowmate.git
cd flowmate
```

2. Install dependencies:

```bash
npm install
```

### Development Server

Run the development server:

```bash
npm start
```

Navigate to `http://localhost:4200/` to view the application.

### Build

Build for production:

```bash
npm run build:prod
```

The build artifacts will be stored in the `dist/` directory.

### Testing

Run unit tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

### Linting

Run ESLint:

```bash
npm run lint
```

Fix linting issues automatically:

```bash
npm run lint:fix
```

## 📁 Project Structure

```
src/
├── app/
│   ├── features/
│   │   └── kanban/                    # Lazy-loaded feature module
│   │       ├── components/
│   │       │   ├── assignee-filter/      # Assignee filtering component
│   │       │   ├── kanban-board/        # Main board container
│   │       │   ├── kanban-card/         # Individual task card
│   │       │   │   ├── assignee-avatar/ # Avatar component
│   │       │   │   └── kanban-card-footer/ # Card footer component
│   │       │   ├── kanban-column/        # Column component
│   │       │   └── task-details/        # Task details dialog
│   │       ├── models/
│   │       │   └── kanban.types.ts      # TypeScript interfaces
│   │       ├── pages/
│   │       │   └── kanban-page/         # Main page component
│   │       ├── services/
│   │       │   └── kanban-data.service.ts # Data service with Signals
│   │       └── utils/
│   │           └── kanban.utils.ts       # Utility functions
│   ├── app.config.ts                    # App configuration
│   └── app.routes.ts                    # Routing with lazy loading
```

## 🎯 Key Implementation Notes

### Signal-Based State Management

**Service Layer (`KanbanDataService`):**

```typescript
// Private signal for source of truth
private readonly columnsSignal = signal<KanbanColumn[]>([]);

// Computed signal for filtered columns
readonly columns = computed(() => {
  const filter = this.assigneeFilter();
  return this.columnsSignal().map(column => ({
    ...column,
    tasks: column.tasks.filter(/* filter logic */)
  }));
});

// Methods update signals, triggering reactivity
updateColumns(columns: KanbanColumn[]): void {
  this.columnsSignal.set(columns);
}
```

**Component Layer:**

```typescript
// Component reads computed signal
readonly columns = computed(() => this.kanbanDataService.columns());

// Template automatically updates when signal changes
// {{ columns() | json }}
```

### Standalone Component Architecture

All components are standalone:

```typescript
@Component({
  selector: 'app-kanban-board',
  imports: [KanbanColumnComponent], // Only import what's needed
  templateUrl: './kanban-board.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanBoardComponent {
  // No NgModule required!
}
```

### Lazy Loading Implementation

Route configuration demonstrates lazy loading:

```typescript
{
  path: 'kanban',
  loadComponent: () =>
    import('./features/kanban/pages/kanban-page/kanban-page.component')
      .then(m => m.KanbanPageComponent),
}
```

### Modern Input/Output API

```typescript
// Modern input API
readonly readOnly = input<boolean>(false);
readonly column = input.required<KanbanColumn>();

// Modern output API
readonly taskClick = output<string>();
readonly taskEdit = output<string>();
```

### Change Detection Strategy

All components use OnPush for optimal performance:

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```

## 🎯 Key Components

### KanbanBoardComponent

Main container component orchestrating columns and drag-and-drop operations.

**Signals Used:**

- `columns`: Computed signal from service
- `draggingColumnId`: Local state signal
- `columnDropIndex`: Local state signal

### KanbanColumnComponent

Represents a single column in the Kanban board.

**Signals Used:**

- `isDragOver`: Local UI state
- `isCreatingTask`: Local UI state
- `displayCount`: Computed from column tasks

### KanbanCardComponent

Individual task card component.

**Features:**

- Signal-based inputs
- Drag handle with native drag API
- Menu actions (edit, delete)

### AssigneeFilterComponent

Filter component using Signals for selection state.

**Signals Used:**

- `selectedIds`: Set of selected assignee IDs
- `isUnassignedSelected`: Boolean signal
- `visibleAssignees`: Computed signal
- `overflowCount`: Computed signal

### TaskDetailsComponent

Modal dialog demonstrating inline editing with Signals.

**Signals Used:**

- `taskSignal`: Task data signal
- `isEditingName`: Edit state signal
- `editedName`: Form state signal
- `assigneeOptions`: Computed from assignees

## 🔧 Configuration

### Angular Configuration

- **Change Detection**: OnPush strategy for optimal performance
- **Standalone Components**: All components are standalone
- **Signals**: Modern reactive state management
- **Lazy Loading**: Feature-based route lazy loading

### Styling

- Tailwind CSS for utility-first styling
- Angular Material for component library
- Custom theme configuration in `src/custom-theme.scss`

### Data Service

The `KanbanDataService` manages all Kanban data:

- Static data initialization (ready for backend integration)
- Column and task CRUD operations
- Assignee filtering logic using Signals
- Signal-based reactivity throughout

## 📝 Usage Examples

### Using the Kanban Board

```typescript
import { KanbanBoardComponent } from './features/kanban/components/kanban-board/kanban-board.component';

@Component({
  selector: 'app-my-component',
  imports: [KanbanBoardComponent],
  template: `
    <app-kanban-board
      [readOnly]="false"
      [showAddTask]="true"
      [showTaskMenu]="true"
      [canDragTasks]="true"
      [canDragColumns]="true"
    />
  `,
})
export class MyComponent {}
```

### Filtering by Assignee

The assignee filter uses Signals for reactive filtering:

```typescript
onAssigneeFilterChange(selectedIds: (string | null)[]): void {
  this.kanbanDataService.setAssigneeFilter(selectedIds);
  // Automatically triggers computed signal update
  // UI updates reactively
}
```

## 🧪 Development Guidelines

### Code Style

- Follow Angular style guide
- Use standalone components exclusively
- Prefer signals over observables for state
- Use OnPush change detection
- TypeScript strict mode enabled

### Component Architecture

- **Functional Core / Imperative Shell**: Separate business logic from I/O
- **Immutability**: Don't mutate passed parameters
- **Error Handling**: Explicit error handling, no silent failures
- **Type Safety**: Explicit types, avoid `any`

### Best Practices

- Keep components small and focused
- Use computed signals for derived state
- Extract reusable logic into services
- Use proper TypeScript types
- Follow accessibility guidelines

## 🚀 Potential Improvements (Next Quarter)

### Backend Integration

- [ ] REST API integration using Angular HttpClient
- [ ] HTTP Interceptors for authentication and error handling
- [ ] Real-time updates using WebSockets or Server-Sent Events
- [ ] Backend data persistence (PostgreSQL/MongoDB)

### Advanced Features

- [ ] User authentication and authorization
- [ ] Team collaboration features
- [ ] Task comments and activity history
- [ ] File attachments
- [ ] Task templates
- [ ] Advanced filtering and sorting
- [ ] Export/import functionality

### AI Integration

- [ ] AI-powered task suggestions
- [ ] Smart task prioritization
- [ ] Automated task categorization
- [ ] Natural language task creation
- [ ] Predictive analytics for project completion

### Performance Enhancements

- [ ] Virtual scrolling for large task lists
- [ ] Service Worker for offline support
- [ ] Progressive Web App (PWA) capabilities
- [ ] Image optimization and lazy loading
- [ ] Bundle size optimization

### Testing

- [ ] Unit tests for all components and services
- [ ] Integration tests for user flows
- [ ] E2E tests with Playwright
- [ ] Performance testing
- [ ] Accessibility testing

## 🐛 Troubleshooting

### Build Issues

If you encounter build errors:

1. Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
2. Clear Angular cache: `rm -rf .angular`
3. Rebuild: `npm run build`

### Linting Errors

Some ESLint rules are disabled for specific use cases. See `eslint.config.js` for details.

## 📄 License

This project is private and proprietary.

## 📞 Support

For issues or questions, please contact the development team.

---

## 📊 Learning Outcomes Summary

### Concepts Mastered

✅ Standalone Components architecture  
✅ Signal-based state management  
✅ Computed signals for derived state  
✅ OnPush change detection optimization  
✅ Lazy loading with routes  
✅ Modern Input/Output API  
✅ Native control flow syntax  
✅ Service-based architecture

### Skills Developed

- Modern Angular development patterns
- Performance optimization techniques
- TypeScript advanced features
- Component composition and reusability
- State management without external libraries

---

Built with ❤️ using Angular 21 | KPI Learning Project
