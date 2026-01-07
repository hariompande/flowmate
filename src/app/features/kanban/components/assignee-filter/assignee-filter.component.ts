import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { NgOptimizedImage } from '@angular/common';
import { KanbanDataService } from '../../services/kanban-data.service';

@Component({
  selector: 'app-assignee-filter',
  imports: [CommonModule, MatMenuModule, MatButtonModule, MatCheckboxModule, MatIconModule, NgOptimizedImage],
  templateUrl: './assignee-filter.component.html',
  styleUrl: './assignee-filter.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssigneeFilterComponent {
  private readonly kanbanDataService = inject(KanbanDataService);

  readonly maxVisible = input<number>(4);
  readonly testIdPrefix = input<string>('assignee-filter');

  readonly selectedChange = output<(string | null)[]>();

  readonly assignees = computed(() => this.kanbanDataService.getAllAssignees());
  readonly selectedIds = signal<Set<string>>(new Set());
  readonly isUnassignedSelected = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly menuOpen = signal<boolean>(false);

  readonly visibleAssignees = computed(() => {
    const assignees = this.assignees();
    return assignees.slice(0, this.maxVisible());
  });

  readonly overflowCount = computed(() => {
    const assignees = this.assignees();
    return Math.max(0, assignees.length - this.maxVisible());
  });

  readonly overflowAssignees = computed(() => {
    const assignees = this.assignees();
    return assignees.slice(this.maxVisible());
  });

  readonly noFilterActive = computed(() => {
    return this.selectedIds().size === 0 && !this.isUnassignedSelected();
  });

  readonly hasOverflowSelected = computed(() => {
    return this.overflowAssignees().some((a) => this.isSelected(a.id));
  });

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  toggleUnassigned(): void {
    this.isUnassignedSelected.update((val) => !val);
    this.emitSelection();
  }

  toggleAssignee(id: string): void {
    const newSet = new Set(this.selectedIds());
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    this.selectedIds.set(newSet);
    this.emitSelection();
  }

  private emitSelection(): void {
    const ids: (string | null)[] = Array.from(this.selectedIds());
    if (this.isUnassignedSelected()) {
      ids.push(null);
    }
    this.selectedChange.emit(ids);
  }

  toggleMenu(): void {
    this.menuOpen.update((val) => !val);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
