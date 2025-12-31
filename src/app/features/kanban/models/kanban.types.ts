export interface KanbanTag {
  label: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'neutral';
}

export interface KanbanCardField {
  key: string;
  label?: string;
  value: string | number | boolean | KanbanTag[] | null;
  type: 'text' | 'date' | 'tags' | 'priority' | 'custom';
  icon?: string;
}

export type PriorityLevel = 'high' | 'medium' | 'low';

export interface CardAssignee {
  id: string;
  name: string;
  avatar?: string;
  profilePicUrl?: string;
  initials: string;
  color: string;
}

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  priority?: PriorityLevel;
  tags?: KanbanTag[];
  dueDate?: string;
  createdAt?: string;
  ticketId?: string;
  fields?: KanbanCardField[];
  draggable?: boolean;
  assignee?: CardAssignee | null;
  showAssignee?: boolean;
  showMenu?: boolean;
}

export interface ColumnAssignee {
  id: string;
  name: string;
  avatar?: string;
  profilePicUrl?: string;
  initials: string;
  color: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  description?: string;
  assignee?: ColumnAssignee | null;
  tasks: KanbanCard[];
  taskCount?: number;
  showCardAssignee?: boolean;
  readOnly?: boolean;
  showAddTask?: boolean;
  showTaskMenu?: boolean;
  loading?: boolean;
}

export interface TaskDropPayload {
  taskId: string;
  fromColumnId: string;
  toColumnId: string;
  toIndex: number;
}

export interface TaskReorderPayload {
  columnId: string;
  fromIndex: number;
  toIndex: number;
}
