import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CalendarDays, 
  FileText, 
  LogOut,
  GraduationCap
} from 'lucide-react';
import { AIAssistant } from './AIAssistant';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
    }`;

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col fixed inset-y-0 z-10 hidden md:flex">
        <div className="p-6 flex items-center gap-2 border-b border-slate-700">
          <GraduationCap className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="font-bold text-xl text-slate-100 tracking-tight">SIGEP</h1>
            <p className="text-xs text-slate-400">UEMA Profitec</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLink to="/" className={navClass}>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          <NavLink to="/semesters" className={navClass}>
            <CalendarDays size={20} />
            Semestres
          </NavLink>
          <NavLink to="/professors" className={navClass}>
            <Users size={20} />
            Professores
          </NavLink>
          <NavLink to="/disciplines" className={navClass}>
            <BookOpen size={20} />
            Disciplinas
          </NavLink>
          <NavLink to="/reports" className={navClass}>
            <FileText size={20} />
            Relatórios
          </NavLink>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold border border-slate-600">
              {user?.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.department}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8 overflow-y-auto h-full bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      <AIAssistant />
    </div>
  );
};