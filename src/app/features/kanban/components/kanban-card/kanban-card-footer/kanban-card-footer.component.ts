import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AssigneeAvatarComponent } from '../assignee-avatar/assignee-avatar.component';
import type { KanbanCard } from '../../../models/kanban.types';

@Component({
  selector: 'app-kanban-card-footer',
  imports: [MatIconModule, AssigneeAvatarComponent],
  template: `
    <div class="flex items-center justify-between pt-2">
      <div class="flex items-center gap-1 text-xs text-neutral-500">
        <mat-icon class="text-neutral-400 text-base">check_box</mat-icon>
        <span class="text-Paragraph-X-Small text-neutral-400" [attr.data-testid]="ticketIdTestId()">
          {{ ticketDisplay() }}
        </span>
      </div>
      @if (showAssignee()) {
        <button
          type="button"
          class="flex items-center gap-1.5 p-1 rounded-md hover:bg-neutral-100 transition-colors"
          [attr.data-testid]="assigneeTestId()"
          [title]="assigneeTitle()"
          (click)="onAssigneeClick()"
        >
          <app-assignee-avatar [assignee]="card().assignee ?? null" />
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanCardFooterComponent {
  readonly card = input.required<KanbanCard>();

  readonly assigneeClick = output<string>();

  readonly ticketIdTestId = computed(() => `kanban-card-ticket-id-${this.card().id}`);
  readonly assigneeTestId = computed(() => `kanban-card-assignee-${this.card().id}`);
  readonly ticketDisplay = computed(() => {
    const card = this.card();
    return card.ticketId ?? `T-${card.id}`;
  });
  readonly assigneeTitle = computed(() => {
    const assignee = this.card().assignee;
    if (!assignee) {
      return 'Assign user';
    }
    return `Assigned to: ${assignee.name || ''}`;
  });
  readonly showAssignee = computed(() => {
    return this.card().showAssignee ?? false;
  });

  onAssigneeClick(): void {
    this.assigneeClick.emit(this.card().id);
  }
}
