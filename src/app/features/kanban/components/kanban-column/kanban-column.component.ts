import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, viewChild } from '@angular/core';
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
  readonly taskDuplicate = output<string>();
  readonly taskDrop = output<TaskDropPayload>();
  readonly taskReorder = output<TaskReorderPayload>();
  readonly addTask = output<string>();
  readonly createTask = output<{ columnId: string; title: string }>();
  readonly openSuggestions = output<string>();
  readonly columnDragStart = output<string>();
  readonly columnDragEnd = output();
  readonly taskAssigneeClick = output<string>();

  readonly taskInputRef = viewChild<HTMLTextAreaElement>('taskInput');

  readonly isDragOver = signal(false);
  readonly dragOverIndex = signal<number | null>(null);
  readonly isColumnDragging = signal(false);
  readonly isCreatingTask = signal(false);
  readonly newTaskTitle = signal('');

  readonly displayCount = computed(() => {
    const col = this.column();
    return col.taskCount ?? col.tasks.length;
  });

  readonly skeletonCardCount = signal(Math.floor(Math.random() * 4) + 1);

  constructor() {
    // Reset drag state on destroy
    effect(() => {
      return (): void => {
        this.isDragOver.set(false);
        this.dragOverIndex.set(null);
        this.isColumnDragging.set(false);
      };
    });
  }

  onDragOver(event: DragEvent): void {
    // Ignore drags in read-only mode
    if (this.readOnly()) return;

    // Ignore column drags - only handle card drags
    if (event.dataTransfer?.types.includes('application/column-id')) {
      return;
    }

    event.preventDefault();
    const dataTransfer = event.dataTransfer;
    if (dataTransfer) {
      dataTransfer.dropEffect = 'move';
    }
    this.isDragOver.set(true);

    // Calculate drop index based on mouse position
    const columnElement = event.currentTarget as HTMLElement;
    const container = columnElement.querySelector(`[data-testid="kanban-column-tasks-${this.column().id}"]`);
    if (!container) return;

    const cards = Array.from(container.querySelectorAll('[data-card-id]'));
    const mouseY = event.clientY;

    let insertIndex = cards.length;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i] as HTMLElement;
      const rect = card.getBoundingClientRect();
      const cardMiddle = rect.top + rect.height / 2;

      if (mouseY < cardMiddle) {
        insertIndex = i;
        break;
      }
    }

    this.dragOverIndex.set(insertIndex);
  }

  onDragLeave(event: DragEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement;
    const columnElement = event.currentTarget as HTMLElement;
    if (!columnElement.contains(relatedTarget)) {
      this.isDragOver.set(false);
      this.dragOverIndex.set(null);
    }
  }

  onDrop(event: DragEvent): void {
    // Ignore column drags
    if (event.dataTransfer?.types.includes('application/column-id')) {
      return;
    }

    event.preventDefault();
    this.isDragOver.set(false);

    const taskId = event.dataTransfer?.getData('text/plain');
    if (!taskId) return;

    const fromColumnId = this.findColumnContainingTask(taskId);
    const toIndex = this.dragOverIndex() ?? this.column().tasks.length;

    this.dragOverIndex.set(null);

    if (fromColumnId === this.column().id) {
      // Reordering within the same column
      const fromIndex = this.column().tasks.findIndex((t) => t.id === taskId);
      if (fromIndex !== -1 && fromIndex !== toIndex) {
        this.taskReorder.emit({
          columnId: this.column().id,
          fromIndex,
          toIndex: toIndex > fromIndex ? toIndex - 1 : toIndex,
        });
      }
    } else if (fromColumnId) {
      // Moving between columns
      this.taskDrop.emit({
        taskId,
        fromColumnId,
        toColumnId: this.column().id,
        toIndex,
      });
    }
  }

  private findColumnContainingTask(taskId: string): string | null {
    // Check if task is in current column
    if (this.column().tasks.some((t) => t.id === taskId)) {
      return this.column().id;
    }
    // For cross-column moves, we extract the source from DOM
    const draggedCard = document.querySelector(`[data-card-id="${taskId}"]`);
    const sourceColumn = draggedCard?.closest('[data-column-id]');
    return sourceColumn?.getAttribute('data-column-id') ?? null;
  }

  onColumnDragStart(event: DragEvent): void {
    const dataTransfer = event.dataTransfer;
    if (!dataTransfer) return;

    dataTransfer.setData('application/column-id', this.column().id);
    dataTransfer.effectAllowed = 'move';
    this.isColumnDragging.set(true);

    // Add visual feedback to the column being dragged
    const target = event.currentTarget as HTMLElement;
    target.style.opacity = '0.5';

    this.columnDragStart.emit(this.column().id);
  }

  onColumnDragEnd(event: DragEvent): void {
    this.isColumnDragging.set(false);
    const target = event.currentTarget as HTMLElement;
    target.style.opacity = '1';

    this.columnDragEnd.emit();
  }

  showTaskInput(): void {
    this.isCreatingTask.set(true);
    setTimeout(() => {
      this.taskInputRef()?.focus();
    }, 0);
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

    this.createTask.emit({
      columnId: this.column().id,
      title,
    });
    this.newTaskTitle.set('');
    setTimeout(() => {
      this.taskInputRef()?.focus();
    }, 0);
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
    // Check if focus is moving to an element within the same container (like the Suggestions link)
    const relatedTarget = event.relatedTarget as HTMLElement | null;
    const container = (event.target as HTMLElement).closest('[data-testid^="kanban-column-task-input-container"]');

    // If focus is moving within the same container, don't hide
    if (relatedTarget && container?.contains(relatedTarget)) {
      return;
    }

    // Small delay to allow click events to fire before hiding
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
