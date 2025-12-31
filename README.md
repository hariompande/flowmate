# Flowmate - Kanban Board Application

A modern, feature-rich Kanban board application built with Angular 21, featuring drag-and-drop task management, assignee filtering, and task details dialog.

## 🚀 Features

### Core Functionality

- **Kanban Board**: Visual task management with customizable columns
- **Drag & Drop**: Intuitive drag-and-drop for tasks and columns
- **Task Management**: Create, edit, and delete tasks with rich metadata
- **Assignee Filtering**: Filter tasks by assignee with visual avatar indicators
- **Task Details Dialog**: Comprehensive task details with inline editing
- **Static Data**: Pre-configured with sample data for demonstration

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
- **State Management**: Angular Signals
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
git clone <repository-url>
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
│   │   └── kanban/
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
│   │       │   └── kanban-data.service.ts # Data service
│   │       └── utils/
│   │           └── kanban.utils.ts       # Utility functions
│   ├── app.config.ts                    # App configuration
│   └── app.routes.ts                    # Routing configuration
```

## 🎯 Key Components

### KanbanBoardComponent

Main container component that orchestrates columns and handles drag-and-drop operations.

**Features:**

- Column management
- Task drag-and-drop between columns
- Column reordering
- Task click/edit handlers

### KanbanColumnComponent

Represents a single column in the Kanban board.

**Features:**

- Task rendering
- Drop zone handling
- Column-specific actions

### KanbanCardComponent

Individual task card component.

**Features:**

- Task information display
- Drag handle
- Menu actions (edit, delete)
- Assignee avatar display
- Tags and fields rendering

### AssigneeFilterComponent

Filter component for filtering tasks by assignee.

**Features:**

- Visual assignee avatars
- Multi-select filtering
- Overflow menu for many assignees
- Unassigned filter option

### TaskDetailsComponent

Modal dialog for viewing and editing task details.

**Features:**

- Inline editing for title and description
- Assignee selection
- Task metadata display
- Notes and activity history tabs (placeholder)

## 🔧 Configuration

### Angular Configuration

- **Change Detection**: OnPush strategy for optimal performance
- **Standalone Components**: All components are standalone
- **Signals**: Modern reactive state management

### Styling

- Tailwind CSS for utility-first styling
- Angular Material for component library
- Custom theme configuration in `src/custom-theme.scss`

### Data Service

The `KanbanDataService` manages all Kanban data:

- Static data initialization
- Column and task CRUD operations
- Assignee filtering logic
- Signal-based reactivity

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

The assignee filter automatically filters tasks displayed in the board:

```typescript
onAssigneeFilterChange(selectedIds: (string | null)[]): void {
  this.kanbanDataService.setAssigneeFilter(selectedIds);
}
```

## 🧪 Development Guidelines

### Code Style

- Follow Angular style guide
- Use standalone components
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

## 🤝 Contributing

This is a private project. For internal contributions, please follow the established code standards and submit pull requests for review.

## 📞 Support

For issues or questions, please contact the development team.

---

Built with ❤️ using Angular 21
