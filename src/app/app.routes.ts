import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/kanban',
    pathMatch: 'full',
  },
  {
    path: 'kanban',
    loadComponent: () =>
      import('./features/kanban/pages/kanban-page/kanban-page.component').then((m) => m.KanbanPageComponent),
  },
];
