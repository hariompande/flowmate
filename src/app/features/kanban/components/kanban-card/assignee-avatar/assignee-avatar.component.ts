import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import type { CardAssignee } from '../../../models/kanban.types';
import { getTextColor } from '../../../utils/kanban.utils';

@Component({
  selector: 'app-assignee-avatar',
  imports: [NgOptimizedImage, MatIconModule],
  template: `
    @if (assignee()) {
      <div
        class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold overflow-hidden"
        [style.backgroundColor]="bgColor()"
        [style.color]="textColor()"
      >
        @if (avatarSrc()) {
          <img class="w-full h-full object-cover" width="24" height="24" [ngSrc]="avatarSrc()!" [alt]="alt()" />
        } @else {
          <span>{{ initials() }}</span>
        }
      </div>
    } @else {
      <div
        class="w-6 h-6 rounded-full flex items-center justify-center bg-neutral-200 text-neutral-500 border border-dashed border-neutral-300"
      >
        <mat-icon class="text-xs">person_add</mat-icon>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssigneeAvatarComponent {
  readonly assignee = input<CardAssignee | null>(null);

  readonly avatarSrc = computed(() => {
    const assignee = this.assignee();
    return assignee?.avatar ?? assignee?.profilePicUrl ?? null;
  });

  readonly initials = computed(() => {
    return this.assignee()?.initials ?? '';
  });

  readonly alt = computed(() => {
    return this.assignee()?.name ?? '';
  });

  readonly bgColor = computed(() => {
    return this.assignee()?.color ?? '#000000';
  });

  readonly textColor = computed(() => {
    return getTextColor(this.bgColor());
  });
}
