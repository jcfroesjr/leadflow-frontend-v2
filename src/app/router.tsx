import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/modules/dashboard/DashboardPage'
import { ConversationsPage } from '@/modules/conversations/ConversationsPage'
import { LeadsPage } from '@/modules/leads/LeadsPage'
import { PipelinePage } from '@/modules/pipeline/PipelinePage'
import { AiAgentPage } from '@/modules/ai-agent/AiAgentPage'
import { CampaignsPage } from '@/modules/campaigns/CampaignsPage'
import { SettingsPage } from '@/modules/settings/SettingsPage'
import LoginPage from '@/pages/LoginPage'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <DashboardPage />, handle: { title: 'Dashboard' } },
      { path: 'conversations', element: <ConversationsPage />, handle: { title: 'Conversas' } },
      { path: 'leads', element: <LeadsPage />, handle: { title: 'Leads' } },
      { path: 'pipeline', element: <PipelinePage />, handle: { title: 'Pipeline' } },
      { path: 'ai-agent', element: <AiAgentPage />, handle: { title: 'Agente IA' } },
      { path: 'campaigns', element: <CampaignsPage />, handle: { title: 'Campanhas' } },
      { path: 'settings', element: <SettingsPage />, handle: { title: 'Configurações' } },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
