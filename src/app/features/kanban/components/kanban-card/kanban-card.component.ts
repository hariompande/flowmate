import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
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

  private dragOverlay: HTMLElement | null = null;

  readonly tagColorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  } as const;

  readonly menuItems: ({ label: string; icon: string; action: () => void; class?: string } | { separator: true })[] = [
    {
      label: 'Edit',
      icon: 'edit',
      action: (): void => {
        this.cardEdit.emit(this.card().id);
      },
    },
    { separator: true },
    {
      label: 'Delete',
      icon: 'delete',
      class: 'text-red-600',
      action: (): void => {
        this.cardDelete.emit(this.card().id);
      },
    },
  ];

  onCardClick(): void {
    this.cardClick.emit(this.card().id);
  }

  onAssigneeClick(event: Event): void {
    event.stopPropagation();
    this.assigneeClick.emit(this.card().id);
  }

  onDragStart(event: DragEvent): void {
    if (!this.draggable() || !event.dataTransfer) return;

    event.dataTransfer.setData('text/plain', this.card().id);
    event.dataTransfer.effectAllowed = 'move';

    const cardElement = (event.target as HTMLElement).closest('[data-card-id]');
    if (!cardElement || !(cardElement instanceof HTMLElement)) return;

    // Hide native drag image
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    event.dataTransfer.setDragImage(img, 0, 0);

    // Create drag overlay
    this.dragOverlay = cardElement.cloneNode(true) as HTMLElement;
    const cardWidth = String(cardElement.offsetWidth);
    Object.assign(this.dragOverlay.style, {
      position: 'fixed',
      pointerEvents: 'none',
      zIndex: '9999',
      width: `${cardWidth}px`,
      transform: 'rotate(3deg) scale(1.05)',
      opacity: '0.9',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      transition: 'transform 0.2s, opacity 0.2s',
    });
    document.body.appendChild(this.dragOverlay);

    this.updateOverlayPosition(event.clientX, event.clientY);
    if (cardElement instanceof HTMLElement) {
      cardElement.style.opacity = '0.4';
    }

    const handleDrag = (e: DragEvent): void => {
      if (this.dragOverlay && e.clientX && e.clientY) {
        this.updateOverlayPosition(e.clientX, e.clientY);
      }
    };

    document.addEventListener('drag', handleDrag);
    (event.target as HTMLElement).addEventListener(
      'dragend',
      () => {
        document.removeEventListener('drag', handleDrag);
      },
      { once: true }
    );

    this.dragStart.emit({ event, id: this.card().id });
  }

  private updateOverlayPosition(x: number, y: number): void {
    if (this.dragOverlay) {
      const offsetWidth = this.dragOverlay.offsetWidth;
      const left = String(x - offsetWidth / 2);
      const top = String(y - 20);
      this.dragOverlay.style.left = `${left}px`;
      this.dragOverlay.style.top = `${top}px`;
    }
  }

  onDragEnd(event: DragEvent): void {
    const cardElement = (event.target as HTMLElement).closest('[data-card-id]');
    if (cardElement instanceof HTMLElement) {
      cardElement.style.opacity = '1';
    }

    if (this.dragOverlay?.parentNode) {
      this.dragOverlay.parentNode.removeChild(this.dragOverlay);
      this.dragOverlay = null;
    }

    this.dragEnd.emit(event);
  }

  getTextColor(backgroundColor: string): string {
    return getTextColor(backgroundColor);
  }

  getTagColorClass(color: string): string {
    return this.tagColorClasses[color as keyof typeof this.tagColorClasses] || this.tagColorClasses.neutral;
  }

  readonly ticketDisplay = computed(() => this.card().ticketId ?? `T-${this.card().id.replace('task-', '')}`);
  readonly hasTags = computed(() => {
    const tags = this.card().tags;
    return Boolean(tags && tags.length > 0);
  });
  readonly tags = computed(() => this.card().tags ?? []);
  readonly hasFields = computed(() => {
    const fields = this.card().fields;
    return Boolean(fields && fields.length > 0);
  });
  readonly fields = computed(() => this.card().fields ?? []);

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onCardClick();
    }
  }
}
