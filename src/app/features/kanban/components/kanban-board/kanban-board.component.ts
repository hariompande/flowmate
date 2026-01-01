import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { KanbanColumnComponent } from '../kanban-column/kanban-column.component';
import { KanbanDataService } from '../../services/kanban-data.service';
import { TaskDetailsComponent } from '../task-details/task-details.component';
import type { TaskDropPayload, TaskReorderPayload } from '../../models/kanban.types';

@Component({
  selector: 'app-kanban-board',
  imports: [KanbanColumnComponent],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanBoardComponent {
  private readonly kanbanDataService = inject(KanbanDataService);
  private readonly dialog = inject(MatDialog);

  readonly readOnly = input<boolean>(false);
  readonly showAddTask = input<boolean>(true);
  readonly showTaskMenu = input<boolean>(true);
  readonly canDragTasks = input<boolean>(true);
  readonly canDragColumns = input<boolean>(true);

  readonly columns = computed(() => this.kanbanDataService.columns());
  readonly draggingColumnId = signal<string | null>(null);
  readonly columnDropIndex = signal<number | null>(null);

  onTaskDrop(payload: TaskDropPayload): void {
    if (this.canDragTasks()) {
      this.kanbanDataService.moveTask(payload.taskId, payload.fromColumnId, payload.toColumnId, payload.toIndex);
    }
  }

  onTaskReorder(payload: TaskReorderPayload): void {
    if (this.canDragTasks()) {
      this.kanbanDataService.reorderTaskInColumn(payload.columnId, payload.fromIndex, payload.toIndex);
    }
  }

  onTaskClick(taskId: string): void {
    this.openTaskDialog(taskId, false);
  }

  onTaskEdit(taskId: string): void {
    this.openTaskDialog(taskId, true);
  }

  private openTaskDialog(taskId: string, isEditing: boolean): void {
    const task = this.kanbanDataService.getTaskById(taskId);
    if (!task) return;

    this.dialog.open(TaskDetailsComponent, {
      width: '90vw',
      maxWidth: '58rem',
      data: {
        task,
        readOnly: this.readOnly(),
        showEditButton: !isEditing && !this.readOnly(),
      },
      panelClass: 'task-details-dialog-panel',
      autoFocus: false,
    });
  }

  onTaskDelete(taskId: string): void {
    if (this.showTaskMenu()) {
      this.kanbanDataService.deleteTask(taskId);
    }
  }

  onCreateTask(payload: { columnId: string; title: string }): void {
    if (this.showAddTask()) {
      this.kanbanDataService.createTask(payload.columnId, payload.title);
    }
  }

  onColumnDragStart(columnId: string): void {
    if (this.canDragColumns()) {
      this.draggingColumnId.set(columnId);
    }
  }

  onColumnDragEnd(): void {
    this.draggingColumnId.set(null);
    this.columnDropIndex.set(null);
  }

  onBoardDragOver(event: DragEvent): void {
    if (!this.canDragColumns() || !this.draggingColumnId()) return;

    event.preventDefault();
    const board = event.currentTarget as HTMLElement;
    const columns = Array.from(board.querySelectorAll('[data-column-id]'));
    const mouseX = event.clientX;

    let insertIndex = columns.length;
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      if (!(column instanceof HTMLElement)) continue;
      const rect = column.getBoundingClientRect();
      if (mouseX < rect.left + rect.width / 2) {
        insertIndex = i;
        break;
      }
    }

    this.columnDropIndex.set(insertIndex);
  }

  onBoardDragLeave(event: DragEvent): void {
    const board = event.currentTarget as HTMLElement;
    const relatedTarget = event.relatedTarget as HTMLElement;
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
        const adjustedIndex = dropIndex > fromIndex ? dropIndex - 1 : dropIndex;
        this.kanbanDataService.reorderColumns(fromIndex, adjustedIndex);
      }
    }

    this.draggingColumnId.set(null);
    this.columnDropIndex.set(null);
  }
}
