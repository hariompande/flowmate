import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AssigneeAvatarComponent } from '../assignee-avatar/assignee-avatar.component';
import type { KanbanCard } from '../../../models/kanban.types';

@Component({
  selector: 'app-kanban-card-footer',
  imports: [AssigneeAvatarComponent],
  templateUrl: './kanban-card-footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanCardFooterComponent {
  readonly card = input.required<KanbanCard>();
  readonly assigneeClick = output<string>();

  readonly ticketDisplay = computed(() => {
    const card = this.card();
    return card.ticketId ?? `T-${card.id.replace('task-', '')}`;
  });

  readonly assigneeTitle = computed(() => {
    const assignee = this.card().assignee;
    return assignee ? `Assigned to: ${assignee.name}` : 'Assign user';
  });

  readonly showAssignee = computed(() => this.card().showAssignee ?? false);
  readonly assignee = computed(() => this.card().assignee ?? null);

  onAssigneeClick(): void {
    this.assigneeClick.emit(this.card().id);
  }
}
