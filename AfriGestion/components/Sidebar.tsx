
import React from 'react';
import { AppView, User } from '../types';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  CalendarDays
} from 'lucide-react';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  onLogout: () => void;
  user: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onLogout, user }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, label: 'Tableau de bord', icon: LayoutDashboard },
    { id: AppView.POS, label: 'Caisse / Ventes', icon: ShoppingCart },
    { id: AppView.DAILY_SALES, label: 'Ventes Journalières', icon: CalendarDays },
    { id: AppView.STOCK, label: 'Gestion Stock', icon: Package },
    { id: AppView.CONTACTS, label: 'Clients & Fournisseurs', icon: Users },
    { id: AppView.ACCOUNTING, label: 'Comptabilité', icon: BarChart3 },
    { id: AppView.SETTINGS, label: 'Paramètres', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col no-print h-screen sticky top-0 shrink-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-emerald-400">AfriGestion</h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Pro Version v1.0</p>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentView === item.id 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{user?.username}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
