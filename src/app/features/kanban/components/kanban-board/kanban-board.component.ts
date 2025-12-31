import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { KanbanColumnComponent } from '../kanban-column/kanban-column.component';
import { KanbanDataService } from '../../services/kanban-data.service';
import { TaskDetailsComponent } from '../task-details/task-details.component';
import type { KanbanCard, TaskDropPayload, TaskReorderPayload } from '../../models/kanban.types';

@Component({
  selector: 'app-kanban-board',
  imports: [KanbanColumnComponent],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanBoardComponent {
  private readonly kanbanDataService: KanbanDataService = inject(KanbanDataService);
  private readonly dialog = inject(MatDialog);

  readonly readOnly = input<boolean>(false);
  readonly showAddTask = input<boolean>(true);
  readonly showTaskMenu = input<boolean>(true);
  readonly canDragTasks = input<boolean>(true);
  readonly canDragColumns = input<boolean>(true);

  readonly columns = computed(() => this.kanbanDataService.columns());

  readonly draggingColumnId = signal<string | null>(null);
  readonly columnDropIndex = signal<number | null>(null);

  constructor() {
    // Initialize with data from service
    effect(() => {
      this.kanbanDataService.getColumns();
    });
  }

  onTaskDrop(payload: TaskDropPayload): void {
    if (!this.canDragTasks()) return;
    this.kanbanDataService.moveTask(payload.taskId, payload.fromColumnId, payload.toColumnId, payload.toIndex);
  }

  onTaskReorder(payload: TaskReorderPayload): void {
    if (!this.canDragTasks()) return;
    this.kanbanDataService.reorderTaskInColumn(payload.columnId, payload.fromIndex, payload.toIndex);
  }

  onTaskClick(taskId: string): void {
    const task: KanbanCard | null = this.kanbanDataService.getTaskById(taskId);
    if (task) {
      this.dialog.open(TaskDetailsComponent, {
        width: '90vw',
        maxWidth: '58rem',
        data: {
          task,
          readOnly: this.readOnly(),
          showEditButton: !this.readOnly(),
        },
        panelClass: 'task-details-dialog-panel',
        autoFocus: false,
      });
    }
  }

  onTaskEdit(taskId: string): void {
    const task: KanbanCard | null = this.kanbanDataService.getTaskById(taskId);
    if (task) {
      this.dialog.open(TaskDetailsComponent, {
        width: '90vw',
        maxWidth: '58rem',
        data: {
          task,
          readOnly: this.readOnly(),
          showEditButton: false,
        },
        panelClass: 'task-details-dialog-panel',
        autoFocus: false,
      });
    }
  }

  onTaskDelete(taskId: string): void {
    if (!this.showTaskMenu()) return;
    this.kanbanDataService.deleteTask(taskId);
  }

  onAddTask(columnId: string): void {
    console.log('Add task to column:', columnId);
    // Handle add task - could open a modal
  }

  onCreateTask(payload: { columnId: string; title: string }): void {
    if (!this.showAddTask()) return;
    this.kanbanDataService.createTask(payload.columnId, payload.title);
  }

  onOpenSuggestions(columnId: string): void {
    console.log('Open suggestions for column:', columnId);
    // Handle suggestions
  }

  onColumnDragStart(columnId: string): void {
    if (!this.canDragColumns()) return;
    this.draggingColumnId.set(columnId);
  }

  onColumnDragEnd(): void {
    this.draggingColumnId.set(null);
    this.columnDropIndex.set(null);
  }

  onBoardDragOver(event: DragEvent): void {
    if (!this.canDragColumns()) return;
    if (!this.draggingColumnId()) return;

    event.preventDefault();

    const board = event.currentTarget as HTMLElement;
    const columnElements = Array.from(board.querySelectorAll('[data-column-id]'));
    const mouseX = event.clientX;

    let insertIndex = columnElements.length;

    for (let i = 0; i < columnElements.length; i++) {
      const col = columnElements[i] as HTMLElement;
      const rect = col.getBoundingClientRect();
      const colMiddle = rect.left + rect.width / 2;

      if (mouseX < colMiddle) {
        insertIndex = i;
        break;
      }
    }

    this.columnDropIndex.set(insertIndex);
  }

  onBoardDragLeave(event: DragEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement;
    const board = event.currentTarget as HTMLElement;

    if (!board.contains(relatedTarget)) {
      this.columnDropIndex.set(null);
    }
  }

  onBoardDrop(event: DragEvent): void {
    if (!this.canDragColumns()) return;
    event.preventDefault();

    const draggingId = this.draggingColumnId();
    const dropIndex = this.columnDropIndex();

    if (draggingId !== null && dropIndex !== null) {
      const columns = this.columns();
      const fromIndex = columns.findIndex((c) => c.id === draggingId);
      if (fromIndex !== -1 && fromIndex !== dropIndex) {
        this.kanbanDataService.reorderColumns(fromIndex, dropIndex > fromIndex ? dropIndex - 1 : dropIndex);
      }
    }

    this.draggingColumnId.set(null);
    this.columnDropIndex.set(null);
  }
}
