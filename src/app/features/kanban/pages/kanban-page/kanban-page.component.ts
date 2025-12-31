import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KanbanBoardComponent } from '../../components/kanban-board/kanban-board.component';
import { AssigneeFilterComponent } from '../../components/assignee-filter/assignee-filter.component';
import { KanbanDataService } from '../../services/kanban-data.service';

@Component({
  selector: 'app-kanban-page',
  imports: [KanbanBoardComponent, AssigneeFilterComponent],
  templateUrl: './kanban-page.component.html',
  styleUrl: './kanban-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanPageComponent {
  private readonly kanbanDataService = inject(KanbanDataService);

  onAssigneeFilterChange(selectedIds: (string | null)[]): void {
    this.kanbanDataService.setAssigneeFilter(selectedIds);
  }
}
