import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { KanbanCardFooterComponent } from './kanban-card-footer/kanban-card-footer.component';
import type { KanbanCard } from '../../models/kanban.types';
import { getTextColor } from '../../utils/kanban.utils';

@Component({
  selector: 'app-kanban-card',
  imports: [MatMenuModule, MatButtonModule, MatIconModule, MatDividerModule, KanbanCardFooterComponent],
  templateUrl: './kanban-card.component.html',
  styleUrl: './kanban-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanCardComponent {
  readonly card = input.required<KanbanCard>();
  readonly draggable = input<boolean>(true);
  readonly showMenu = input<boolean>(true);

  readonly cardClick = output<string>();
  readonly cardEdit = output<string>();
  readonly cardDelete = output<string>();
  readonly dragStart = output<{ event: DragEvent; id: string }>();
  readonly dragEnd = output<DragEvent>();
  readonly assigneeClick = output<string>();

  private readonly dragOverlay = signal<HTMLElement | null>(null);

  readonly tagColorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    neutral: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  };

  readonly menuItems = computed(
    () =>
      [
        {
          label: 'Edit',
          icon: 'edit',
          action: (): void => {
            this.cardEdit.emit(this.card().id);
          },
        },
        {
          separator: true,
        },
        {
          label: 'Delete',
          icon: 'delete',
          class: 'text-red-600',
          action: (): void => {
            this.cardDelete.emit(this.card().id);
          },
        },
      ] as ({ label: string; icon: string; action: () => void; class?: string } | { separator: true })[]
  );

  constructor() {
    // Clean up drag overlay on destroy
    effect(() => {
      return (): void => {
        const overlay = this.dragOverlay();
        if (overlay?.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      };
    });
  }

  onCardClick(): void {
    this.cardClick.emit(this.card().id);
  }

  onAssigneeClick(event: Event): void {
    event.stopPropagation();
    this.assigneeClick.emit(this.card().id);
  }

  onDragStart(event: DragEvent): void {
    if (!this.draggable()) return;

    const dataTransfer = event.dataTransfer;
    if (!dataTransfer) return;

    dataTransfer.setData('text/plain', this.card().id);
    dataTransfer.effectAllowed = 'move';

    const target = event.target as HTMLElement;
    const cardElement = target.closest('[data-card-id]');
    if (!cardElement || !(cardElement instanceof HTMLElement)) return;

    // Hide native drag image with transparent pixel
    const transparentImg = new Image();
    transparentImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    dataTransfer.setDragImage(transparentImg, 0, 0);

    // Create custom tilted overlay with initial animation state
    const overlay = cardElement.cloneNode(true) as HTMLElement;
    overlay.style.position = 'fixed';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '9999';
    overlay.style.width = `${String(cardElement.offsetWidth)}px`;
    overlay.style.background = 'white';
    overlay.style.borderRadius = '8px';
    overlay.style.transform = 'rotate(0deg) scale(1)';
    overlay.style.opacity = '0';
    overlay.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    overlay.style.transition =
      'transform 0.2s cubic-bezier(0.2, 0, 0, 1), opacity 0.15s ease-out, box-shadow 0.2s ease-out';
    document.body.appendChild(overlay);
    this.dragOverlay.set(overlay);

    // Position at mouse
    this.updateOverlayPosition(event.clientX, event.clientY, cardElement.offsetWidth);

    // Animate in on next frame
    requestAnimationFrame(() => {
      const currentOverlay = this.dragOverlay();
      if (currentOverlay) {
        currentOverlay.style.transform = 'rotate(4deg) scale(1.02)';
        currentOverlay.style.opacity = '0.95';
        currentOverlay.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)';
      }
      // Fade out the original card smoothly
      cardElement.style.transition = 'opacity 0.15s ease-out';
      cardElement.style.opacity = '0.3';
    });

    // Listen for drag movement
    document.addEventListener('drag', this.handleDragMove);

    this.dragStart.emit({ event, id: this.card().id });
  }

  private readonly handleDragMove = (event: DragEvent): void => {
    const overlay = this.dragOverlay();
    if (overlay && event.clientX !== 0 && event.clientY !== 0) {
      this.updateOverlayPosition(event.clientX, event.clientY, overlay.offsetWidth);
    }
  };

  private updateOverlayPosition(x: number, y: number, width: number): void {
    const overlay = this.dragOverlay();
    if (overlay) {
      overlay.style.left = `${String(x - width / 2)}px`;
      overlay.style.top = `${String(y - 20)}px`;
    }
  }

  onDragEnd(event: DragEvent): void {
    const target = event.target as HTMLElement;
    const cardElement = target.closest('[data-card-id]');
    if (!cardElement || !(cardElement instanceof HTMLElement)) return;

    // Clean up event listener
    document.removeEventListener('drag', this.handleDragMove);

    // Remove overlay immediately
    const overlay = this.dragOverlay();
    if (overlay?.parentNode) {
      overlay.parentNode.removeChild(overlay);
      this.dragOverlay.set(null);
    }

    // Restore original card immediately
    cardElement.style.transition = '';
    cardElement.style.opacity = '1';

    this.dragEnd.emit(event);
  }

  getTextColor(backgroundColor: string): string {
    return getTextColor(backgroundColor);
  }

  getTagColorClass(color: string): string {
    return this.tagColorClasses[color as keyof typeof this.tagColorClasses] || this.tagColorClasses.neutral;
  }

  readonly cardTestId = computed(() => `kanban-card-${this.card().id}`);
  readonly cardDataId = computed(() => this.card().id);
  readonly titleTestId = computed(() => `kanban-card-title-${this.card().id}`);
  readonly menuTestId = computed(() => `kanban-card-menu-${this.card().id}`);
  readonly descriptionTestId = computed(() => `kanban-card-description-${this.card().id}`);
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
  readonly assigneeBgColor = computed(() => {
    return this.card().assignee?.color ?? '#000000';
  });
  readonly assigneeTextColor = computed(() => {
    return this.getTextColor(this.assigneeBgColor());
  });
  readonly assigneeAvatarSrc = computed(() => {
    const assignee = this.card().assignee;
    return assignee?.avatar ?? assignee?.profilePicUrl ?? null;
  });
  readonly assigneeAlt = computed(() => {
    return this.card().assignee?.name ?? '';
  });
  readonly assigneeInitials = computed(() => {
    return this.card().assignee?.initials ?? '';
  });

  readonly hasTags = computed(() => {
    const tags = this.card().tags;
    return Boolean(tags && tags.length > 0);
  });

  readonly hasFields = computed(() => {
    const fields = this.card().fields;
    return Boolean(fields && fields.length > 0);
  });

  readonly showFooter = computed(() => {
    const card = this.card();
    const hasContent = card.ticketId != null || card.id != null || card.showAssignee === true;
    return hasContent;
  });

  readonly assigneeRenderState = computed(() => {
    const card = this.card();
    if (!card.showAssignee) {
      return null;
    }
    if (!card.assignee) {
      return 'placeholder';
    }
    const avatarSrc = card.assignee.avatar ?? card.assignee.profilePicUrl ?? null;
    return avatarSrc ? 'avatar' : 'initials';
  });

  getTagTestId(index: number): string {
    return `kanban-card-tag-${this.card().id}-${String(index)}`;
  }

  getMenuItemTestId(label: string): string {
    return `kanban-card-menu-item-${label.toLowerCase()}-${this.card().id}`;
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onCardClick();
    }
  }

  readonly showAssigneeSection = computed(() => {
    return this.card().showAssignee;
  });
}
