import { LayoutDashboard, CheckSquare, Settings, Plus, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboards', path: '/dashboard' },
    { icon: CheckSquare, label: 'Your work', path: '/dashboard/work' },
    { icon: Users, label: 'Teams', path: '/dashboard/teams' },
    { icon: Users, label: 'Team Members', path: '/dashboard/team-mates' }
  ];

  return (
    <aside className="w-[240px] flex-shrink-0 border-r border-border bg-card flex flex-col h-screen sticky top-0">
      {/* Brand & Workspace */}
      <div className="h-14 flex items-center px-4 border-b border-border">
        <div className="w-8 h-8 bg-primary rounded bg-blue-600 flex items-center justify-center mr-3 hover:bg-blue-700 cursor-pointer transition-colors">
          <span className="text-white font-bold text-lg leading-none">J</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-card-foreground leading-tight">Jira Clone</span>
          <span className="text-[11px] text-muted-foreground leading-tight">Software project</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
        {/* Actions */}
        <div className="pb-4">
          <button className="w-full flex items-center gap-2 px-2 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-md">
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>

        {/* Navigation */}
        <div className="space-y-0.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-card-foreground'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="my-4 border-t border-border" />

        {/* Project Links */}
        <div className="space-y-0.5">
          <p className="px-3 pb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Planning
          </p>
          <NavLink
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors bg-primary/10 text-primary"
          >
            <CheckSquare className="w-4 h-4" />
            Board
          </NavLink>
        </div>
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-border">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
          <Settings className="w-4 h-4" />
          Project settings
        </button>
      </div>
    </aside>
  );
}
