import React from 'react';
import { useData } from '../contexts/DataContext';
import { Users, BookOpen, CalendarDays, TrendingUp, BarChart3 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { professors, disciplines, semesters } = useData();

  const activeSemester = semesters.find(s => s.status === 'active');
  const totalOfferings = activeSemester ? activeSemester.offerings.length : 0;

  // Calculate Stats for Chart
  const titulationCounts = {
    'Doutor': professors.filter(p => p.titulation === 'Doutor').length,
    'Mestre': professors.filter(p => p.titulation === 'Mestre').length,
    'Especialista': professors.filter(p => p.titulation === 'Especialista').length,
    'Graduado': professors.filter(p => p.titulation === 'Graduado').length,
  };
  const maxCount = Math.max(...Object.values(titulationCounts), 1);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-100">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-100">Visão Geral</h2>
        <span className="bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full text-sm font-medium border border-blue-800">
          Semestre Atual: {activeSemester ? activeSemester.name : 'Nenhum'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Professores" 
          value={professors.length} 
          icon={Users} 
          color="bg-emerald-600" 
        />
        <StatCard 
          title="Disciplinas" 
          value={disciplines.length} 
          icon={BookOpen} 
          color="bg-violet-600" 
        />
        <StatCard 
          title="Semestres" 
          value={semesters.length} 
          icon={CalendarDays} 
          color="bg-amber-600" 
        />
        <StatCard 
          title="Aulas Ativas" 
          value={totalOfferings} 
          icon={TrendingUp} 
          color="bg-blue-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                    <BarChart3 size={18} className="text-blue-400"/>
                    Distribuição por Titulação
                </h3>
            </div>
            <div className="space-y-4">
                {Object.entries(titulationCounts).map(([title, count]) => (
                    <div key={title}>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>{title}</span>
                            <span>{count}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                            <div 
                                className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" 
                                style={{ width: `${(count / maxCount) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg p-6 flex flex-col justify-center items-center text-center">
            <div className="bg-slate-700 p-4 rounded-full mb-4">
                <CalendarDays className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="font-semibold text-slate-100">Semestre Ativo</h3>
            <p className="text-slate-400 text-sm mt-2 mb-4">
                {activeSemester 
                    ? `O semestre ${activeSemester.name} está em andamento até ${new Date(activeSemester.endDate).toLocaleDateString('pt-BR')}.`
                    : "Não há semestre ativo no momento."
                }
            </p>
            <button className="text-blue-400 font-medium text-sm hover:text-blue-300 hover:underline">Ver detalhes</button>
        </div>
      </div>
    </div>
  );
};