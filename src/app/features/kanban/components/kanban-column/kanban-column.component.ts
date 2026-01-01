import { ChangeDetectionStrategy, Component, computed, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { KanbanCardComponent } from '../kanban-card/kanban-card.component';
import type { KanbanColumn, TaskDropPayload, TaskReorderPayload } from '../../models/kanban.types';
import { getTextColor, getInitials } from '../../utils/kanban.utils';

@Component({
  selector: 'app-kanban-column',
  imports: [FormsModule, MatIconModule, KanbanCardComponent],
  templateUrl: './kanban-column.component.html',
  styleUrl: './kanban-column.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanColumnComponent {
  readonly column = input.required<KanbanColumn>();
  readonly showCardAssignee = input<boolean>(false);
  readonly readOnly = input<boolean>(false);
  readonly showAddTask = input<boolean>(true);
  readonly showTaskMenu = input<boolean>(true);
  readonly loading = input<boolean>(false);

  readonly taskClick = output<string>();
  readonly taskEdit = output<string>();
  readonly taskDelete = output<string>();
  readonly taskDrop = output<TaskDropPayload>();
  readonly taskReorder = output<TaskReorderPayload>();
  readonly createTask = output<{ columnId: string; title: string }>();
  readonly columnDragStart = output<string>();
  readonly columnDragEnd = output();
  readonly taskAssigneeClick = output<string>();

  readonly taskInputRef = viewChild<HTMLTextAreaElement>('taskInput');

  readonly isDragOver = signal(false);
  readonly dragOverIndex = signal<number | null>(null);
  readonly isCreatingTask = signal(false);
  readonly newTaskTitle = signal('');

  readonly displayCount = computed(() => this.column().taskCount ?? this.column().tasks.length);

  onDragOver(event: DragEvent): void {
    if (this.readOnly() || event.dataTransfer?.types.includes('application/column-id')) return;

    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    this.isDragOver.set(true);

    const container = (event.currentTarget as HTMLElement).querySelector(
      `[data-testid="kanban-column-tasks-${this.column().id}"]`
    );
    if (!container) return;

    const cards = Array.from(container.querySelectorAll('[data-card-id]'));
    const mouseY = event.clientY;
    let insertIndex = cards.length;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (!(card instanceof HTMLElement)) continue;
      const rect = card.getBoundingClientRect();
      if (mouseY < rect.top + rect.height / 2) {
        insertIndex = i;
        break;
      }
    }

    this.dragOverIndex.set(insertIndex);
  }

  onDragLeave(event: DragEvent): void {
    const column = event.currentTarget as HTMLElement;
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (!column.contains(relatedTarget)) {
      this.isDragOver.set(false);
      this.dragOverIndex.set(null);
    }
  }

  onDrop(event: DragEvent): void {
    if (event.dataTransfer?.types.includes('application/column-id')) return;

    event.preventDefault();
    this.isDragOver.set(false);

    const taskId = event.dataTransfer?.getData('text/plain');
    if (!taskId) return;

    const fromColumnId = this.findColumnContainingTask(taskId);
    const toIndex = this.dragOverIndex() ?? this.column().tasks.length;
    this.dragOverIndex.set(null);

    if (fromColumnId === this.column().id) {
      const fromIndex = this.column().tasks.findIndex((t) => t.id === taskId);
      if (fromIndex !== -1 && fromIndex !== toIndex) {
        this.taskReorder.emit({
          columnId: this.column().id,
          fromIndex,
          toIndex: toIndex > fromIndex ? toIndex - 1 : toIndex,
        });
      }
    } else if (fromColumnId) {
      this.taskDrop.emit({
        taskId,
        fromColumnId,
        toColumnId: this.column().id,
        toIndex,
      });
    }
  }

  private findColumnContainingTask(taskId: string): string | null {
    if (this.column().tasks.some((t) => t.id === taskId)) {
      return this.column().id;
    }
    const draggedCard = document.querySelector(`[data-card-id="${taskId}"]`);
    return draggedCard?.closest('[data-column-id]')?.getAttribute('data-column-id') ?? null;
  }

  onColumnDragStart(event: DragEvent): void {
    const dataTransfer = event.dataTransfer;
    if (!dataTransfer) return;

    dataTransfer.setData('application/column-id', this.column().id);
    dataTransfer.effectAllowed = 'move';
    (event.currentTarget as HTMLElement).style.opacity = '0.5';
    this.columnDragStart.emit(this.column().id);
  }

  onColumnDragEnd(event: DragEvent): void {
    (event.currentTarget as HTMLElement).style.opacity = '1';
    this.columnDragEnd.emit();
  }

  showTaskInput(): void {
    this.isCreatingTask.set(true);
    setTimeout(() => this.taskInputRef()?.focus(), 0);
  }

  hideTaskInput(): void {
    this.isCreatingTask.set(false);
    this.newTaskTitle.set('');
  }

  onCreateTask(): void {
    const title = this.newTaskTitle().trim();
    if (!title) {
      this.hideTaskInput();
      return;
    }

    this.createTask.emit({ columnId: this.column().id, title });
    this.newTaskTitle.set('');
    setTimeout(() => this.taskInputRef()?.focus(), 0);
  }

  onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onCreateTask();
    } else if (event.key === 'Escape') {
      this.hideTaskInput();
    }
  }

  onInputBlur(event: FocusEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement | null;
    const container = (event.target as HTMLElement).closest('[data-testid^="kanban-column-task-input-container"]');
    if (relatedTarget && container?.contains(relatedTarget)) return;

    setTimeout(() => {
      if (!this.newTaskTitle().trim() && this.isCreatingTask()) {
        this.hideTaskInput();
      }
    }, 150);
  }

  getTextColor(backgroundColor: string): string {
    return getTextColor(backgroundColor);
  }

  getInitials(name: string): string {
    return getInitials(name);
  }
}
