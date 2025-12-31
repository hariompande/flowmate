import { ChangeDetectionStrategy, Component, computed, effect, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';
import { KanbanDataService } from '../../services/kanban-data.service';
import { AssigneeAvatarComponent } from '../kanban-card/assignee-avatar/assignee-avatar.component';
import type { KanbanCard } from '../../models/kanban.types';
import { getTextColor } from '../../utils/kanban.utils';

@Component({
  selector: 'app-task-details',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    NgOptimizedImage,
    AssigneeAvatarComponent,
  ],
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetailsComponent {
  private readonly kanbanDataService = inject(KanbanDataService);
  private readonly dialogRef = inject(MatDialogRef<TaskDetailsComponent>);
  private readonly dialogData = inject<{ task: KanbanCard; readOnly?: boolean; showEditButton?: boolean }>(
    MAT_DIALOG_DATA
  );

  readonly taskSignal = signal<KanbanCard | null>(this.dialogData?.task || null);
  readonly readOnlySignal = signal<boolean>(this.dialogData?.readOnly ?? false);
  readonly showEditButtonSignal = signal<boolean>(this.dialogData?.showEditButton ?? true);

  readonly edit = output<KanbanCard>();

  readonly visible = signal<boolean>(true);
  readonly activeTabIndex = signal<number>(0);
  readonly isEditingName = signal<boolean>(false);
  readonly isEditingDescription = signal<boolean>(false);
  readonly editedName = signal<string>('');
  readonly editedDescription = signal<string>('');

  readonly taskComputed = computed(() => this.taskSignal());
  readonly readOnlyComputed = computed(() => this.readOnlySignal());
  readonly showEditButtonComputed = computed(() => this.showEditButtonSignal());

  readonly taskId = computed(() => {
    const task = this.taskComputed();
    return task?.ticketId ?? (task ? `T-${task.id.replace('task-', '')}` : '--');
  });

  readonly assignees = computed(() => this.kanbanDataService.getAllAssignees());

  readonly assigneeOptions = computed(() => {
    const assignees = this.assignees();
    return [
      { value: null, label: 'Unassigned', color: '#94a3b8', avatar: undefined, initials: 'U' },
      ...assignees.map((a) => ({
        value: a.id,
        label: a.name,
        color: a.color,
        avatar: a.avatar || a.profilePicUrl,
        initials: a.initials,
      })),
    ];
  });

  readonly selectedAssignee = computed(() => {
    const task = this.taskComputed();
    if (!task?.assignee) return null;
    return this.assignees().find((a) => a.id === task.assignee!.id) || null;
  });

  readonly selectedAssigneeId = signal<string | null>(null);

  constructor() {
    effect(() => {
      const task = this.taskComputed();
      if (task) {
        this.editedName.set(task.title);
        this.editedDescription.set(task.description || '');
        this.selectedAssigneeId.set(task.assignee?.id || null);
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onEdit(): void {
    const task = this.taskComputed();
    if (task) {
      this.edit.emit(task);
    }
  }

  startEditName(): void {
    if (this.readOnlyComputed()) return;
    this.isEditingName.set(true);
  }

  finishEditName(): void {
    this.isEditingName.set(false);
    const task = this.taskComputed();
    if (task && this.editedName().trim()) {
      // Update task in service
      const columns = this.kanbanDataService.getColumns();
      for (const column of columns) {
        const foundTask = column.tasks.find((t) => t.id === task.id);
        if (foundTask) {
          foundTask.title = this.editedName();
          break;
        }
      }
    }
  }

  startEditDescription(): void {
    if (this.readOnlyComputed()) return;
    this.isEditingDescription.set(true);
  }

  finishEditDescription(): void {
    this.isEditingDescription.set(false);
    const task = this.taskComputed();
    if (task) {
      const columns = this.kanbanDataService.getColumns();
      for (const column of columns) {
        const foundTask = column.tasks.find((t) => t.id === task.id);
        if (foundTask) {
          foundTask.description = this.editedDescription();
          break;
        }
      }
    }
  }

  onAssigneeChange(assigneeId: string | null): void {
    this.selectedAssigneeId.set(assigneeId);
    const task = this.taskComputed();
    if (task) {
      const columns = this.kanbanDataService.getColumns();
      for (const column of columns) {
        const foundTask = column.tasks.find((t) => t.id === task.id);
        if (foundTask) {
          if (assigneeId) {
            const assignee = this.assignees().find((a) => a.id === assigneeId);
            foundTask.assignee = assignee || null;
          } else {
            foundTask.assignee = null;
          }
          break;
        }
      }
    }
  }

  getTextColor = getTextColor;
}
