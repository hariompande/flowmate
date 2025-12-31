import { Injectable, signal, computed } from '@angular/core';
import type { KanbanCard, KanbanColumn, CardAssignee } from '../models/kanban.types';

@Injectable({
  providedIn: 'root',
})
export class KanbanDataService {
  private readonly initialColumns: KanbanColumn[] = [
    {
      id: 'col-1',
      title: 'To Do',
      tasks: [
        {
          id: 'task-1',
          title: 'Design new landing page',
          description: 'Create wireframes and mockups for the new landing page design',
          priority: 'high',
          tags: [
            { label: 'Design', color: 'purple' },
            { label: 'Frontend', color: 'blue' },
          ],
          ticketId: 'T-101',
          assignee: {
            id: 'user-1',
            name: 'John Doe',
            initials: 'JD',
            color: '#C0D5FF',
          },
          showAssignee: true,
        },
        {
          id: 'task-2',
          title: 'Setup CI/CD pipeline',
          description: 'Configure GitHub Actions for automated testing and deployment',
          priority: 'medium',
          tags: [{ label: 'DevOps', color: 'green' }],
          ticketId: 'T-102',
          assignee: {
            id: 'user-2',
            name: 'Jane Smith',
            initials: 'JS',
            color: '#FFD5C0',
          },
          showAssignee: true,
        },
        {
          id: 'task-3',
          title: 'Write API documentation',
          description: 'Document all REST API endpoints with examples',
          priority: 'low',
          tags: [{ label: 'Documentation', color: 'orange' }],
          ticketId: 'T-103',
          showAssignee: true,
        },
      ],
    },
    {
      id: 'col-2',
      title: 'In Progress',
      tasks: [
        {
          id: 'task-4',
          title: 'Implement user authentication',
          description: 'Add login, signup, and password reset functionality',
          priority: 'high',
          tags: [
            { label: 'Backend', color: 'red' },
            { label: 'Security', color: 'purple' },
          ],
          ticketId: 'T-104',
          assignee: {
            id: 'user-3',
            name: 'Bob Johnson',
            initials: 'BJ',
            color: '#C0FFD5',
          },
          showAssignee: true,
        },
        {
          id: 'task-5',
          title: 'Create database schema',
          description: 'Design and implement the database schema for the application',
          priority: 'high',
          tags: [{ label: 'Database', color: 'blue' }],
          ticketId: 'T-105',
          assignee: {
            id: 'user-1',
            name: 'John Doe',
            initials: 'JD',
            color: '#C0D5FF',
          },
          showAssignee: true,
        },
      ],
    },
    {
      id: 'col-3',
      title: 'Review',
      tasks: [
        {
          id: 'task-6',
          title: 'Code review: Payment module',
          description: 'Review the payment integration code for security and best practices',
          priority: 'high',
          tags: [
            { label: 'Review', color: 'orange' },
            { label: 'Payment', color: 'red' },
          ],
          ticketId: 'T-106',
          assignee: {
            id: 'user-2',
            name: 'Jane Smith',
            initials: 'JS',
            color: '#FFD5C0',
          },
          showAssignee: true,
        },
      ],
    },
    {
      id: 'col-4',
      title: 'Done',
      tasks: [
        {
          id: 'task-7',
          title: 'Setup project structure',
          description: 'Initialize Angular project with proper folder structure',
          priority: 'medium',
          tags: [{ label: 'Setup', color: 'green' }],
          ticketId: 'T-107',
          assignee: {
            id: 'user-3',
            name: 'Bob Johnson',
            initials: 'BJ',
            color: '#C0FFD5',
          },
          showAssignee: true,
        },
        {
          id: 'task-8',
          title: 'Configure ESLint and Prettier',
          description: 'Setup code quality tools and formatting rules',
          priority: 'low',
          tags: [{ label: 'Tooling', color: 'neutral' }],
          ticketId: 'T-108',
          showAssignee: true,
        },
      ],
    },
  ];

  private readonly columnsSignal = signal<KanbanColumn[]>(this.initialColumns);
  private readonly filteredAssigneeIds = signal<Set<string | null>>(new Set());

  readonly columns = computed(() => {
    const allColumns = this.columnsSignal();
    const filterIds = this.filteredAssigneeIds();

    if (filterIds.size === 0) {
      return allColumns;
    }

    return allColumns.map((column) => ({
      ...column,
      tasks: column.tasks.filter((task) => {
        if (!task.assignee) {
          return filterIds.has(null);
        }
        return filterIds.has(task.assignee.id);
      }),
    }));
  });

  getColumns(): KanbanColumn[] {
    return this.columnsSignal();
  }

  updateColumns(columns: KanbanColumn[]): void {
    this.columnsSignal.set(columns);
  }

  moveTask(taskId: string, fromColumnId: string, toColumnId: string, toIndex: number): void {
    const columns = [...this.columnsSignal()];
    const fromColumn = columns.find((c) => c.id === fromColumnId);
    const toColumn = columns.find((c) => c.id === toColumnId);

    if (!fromColumn || !toColumn) return;

    const taskIndex = fromColumn.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    const task = fromColumn.tasks[taskIndex];

    // Remove from source column
    fromColumn.tasks = fromColumn.tasks.filter((t) => t.id !== taskId);

    // Add to target column at specified index
    const newTasks = [...toColumn.tasks];
    if (task) {
      newTasks.splice(toIndex, 0, task);
      toColumn.tasks = newTasks;
    }

    this.columnsSignal.set(columns);
  }

  reorderTaskInColumn(columnId: string, fromIndex: number, toIndex: number): void {
    const columns = [...this.columnsSignal()];
    const column = columns.find((c) => c.id === columnId);
    if (!column) return;

    const tasks = [...column.tasks];
    const [movedTask] = tasks.splice(fromIndex, 1);
    if (movedTask) {
      tasks.splice(toIndex, 0, movedTask);
      column.tasks = tasks;
    }

    this.columnsSignal.set(columns);
  }

  reorderColumns(fromIndex: number, toIndex: number): void {
    const columns = [...this.columnsSignal()];
    const [movedColumn] = columns.splice(fromIndex, 1);
    if (movedColumn) {
      columns.splice(toIndex, 0, movedColumn);
      this.columnsSignal.set(columns);
    }
  }

  createTask(columnId: string, title: string): void {
    const columns = [...this.columnsSignal()];
    const column = columns.find((c) => c.id === columnId);
    if (!column) return;

    const newTask: KanbanCard = {
      id: `task-${String(Date.now())}`,
      title,
      priority: 'medium',
      ticketId: `T-${String(Math.floor(Math.random() * 1000))}`,
      showAssignee: true,
    };

    column.tasks = [...column.tasks, newTask];
    this.columnsSignal.set(columns);
  }

  deleteTask(taskId: string): void {
    const columns = [...this.columnsSignal()];
    for (const column of columns) {
      column.tasks = column.tasks.filter((t) => t.id !== taskId);
    }
    this.columnsSignal.set(columns);
  }

  getAllAssignees(): CardAssignee[] {
    const assigneesMap = new Map<string, CardAssignee>();
    const columns = this.columnsSignal();

    for (const column of columns) {
      for (const task of column.tasks) {
        if (task.assignee) {
          assigneesMap.set(task.assignee.id, task.assignee);
        }
      }
    }

    return Array.from(assigneesMap.values());
  }

  setAssigneeFilter(selectedIds: (string | null)[]): void {
    if (selectedIds.length === 0) {
      this.filteredAssigneeIds.set(new Set());
    } else {
      this.filteredAssigneeIds.set(new Set(selectedIds));
    }
  }

  getTaskById(taskId: string): KanbanCard | null {
    const columns = this.columnsSignal();
    for (const column of columns) {
      const task = column.tasks.find((t) => t.id === taskId);
      if (task) {
        return task;
      }
    }
    return null;
  }
}
