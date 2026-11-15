import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { Overview } from './features/overview/overview';
import { AutomationComponent } from './features/automation/automation';
import { AiConfig } from './features/ai-agent/ai-config';
import { AiChat } from './features/ai-agent/ai-chat';
import { AiPermissionsComponent } from './features/ai-agent/ai-permissions';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'overview',
    component: Overview
  },
  {
    path: 'dashboard',
    component: Dashboard
  },
  {
    path: 'automation',
    component: AutomationComponent
  },
  {
    path: 'ai-config',
    component: AiConfig
  },
  {
    path: 'ai-chat',
    component: AiChat
  },
  {
    path: 'ai-permissions',
    component: AiPermissionsComponent
  }
];
