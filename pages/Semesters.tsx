import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Semester, SemesterDiscipline } from '../types';
import { Plus, ChevronDown, ChevronRight, UserPlus, Trash2, Calendar } from 'lucide-react';

export const Semesters: React.FC = () => {
  const { 
    semesters, addSemester, updateSemesterStatus, 
    professors, disciplines,
    addOfferingToSemester, removeOfferingFromSemester
  } = useData();

  const [expandedSemester, setExpandedSemester] = useState<string | null>(semesters[0]?.id || null);
  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false);
  const [isOfferingModalOpen, setIsOfferingModalOpen] = useState(false);
  
  // New Semester Form
  const [newSemesterData, setNewSemesterData] = useState({ name: '', startDate: '', endDate: '' });
  
  // Offering Form
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');
  const [offeringData, setOfferingData] = useState({
    disciplineId: '',
    professorId: '',
    workload: 60
  });

  const handleCreateSemester = (e: React.FormEvent) => {
    e.preventDefault();
    addSemester({
      name: newSemesterData.name,
      status: 'planning',
      startDate: newSemesterData.startDate,
      endDate: newSemesterData.endDate
    });
    setIsSemesterModalOpen(false);
    setNewSemesterData({ name: '', startDate: '', endDate: '' });
  };

  const handleAddOffering = (e: React.FormEvent) => {
    e.preventDefault();
    if(!selectedSemesterId) return;

    // Auto set workload based on discipline if default
    const disc = disciplines.find(d => d.id === offeringData.disciplineId);
    
    addOfferingToSemester(selectedSemesterId, {
      disciplineId: offeringData.disciplineId,
      professorId: offeringData.professorId || null,
      workload: offeringData.workload || disc?.defaultWorkload || 60
    });
    setIsOfferingModalOpen(false);
  };

  const getProfessorName = (id: string | null) => {
    if (!id) return <span className="text-amber-400 font-medium text-xs bg-amber-900/30 border border-amber-800 px-2 py-1 rounded">Pendente</span>;
    return professors.find(p => p.id === id)?.name || 'Desconhecido';
  };

  const getDisciplineName = (id: string) => disciplines.find(d => d.id === id)?.name || 'Desconhecida';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-100">Gestão de Semestres</h2>
        <button 
          onClick={() => setIsSemesterModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={18} />
          Novo Semestre
        </button>
      </div>

      <div className="space-y-4">
        {semesters.map(semester => (
          <div key={semester.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
            {/* Header */}
            <div 
              className="p-4 bg-slate-800/50 flex items-center justify-between cursor-pointer hover:bg-slate-700/50 transition"
              onClick={() => setExpandedSemester(expandedSemester === semester.id ? null : semester.id)}
            >
              <div className="flex items-center gap-4">
                {expandedSemester === semester.id ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
                <div>
                  <h3 className="font-bold text-slate-100 text-lg">{semester.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(semester.startDate).toLocaleDateString()} - {new Date(semester.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border capitalize ${
                  semester.status === 'active' ? 'bg-green-900/30 text-green-400 border-green-800' :
                  semester.status === 'planning' ? 'bg-blue-900/30 text-blue-400 border-blue-800' :
                  'bg-slate-700 text-slate-400 border-slate-600'
                }`}>
                  {semester.status === 'planning' ? 'Planejamento' : semester.status === 'active' ? 'Ativo' : 'Encerrado'}
                </span>
              </div>
              
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                {semester.status !== 'closed' && (
                    <button 
                        onClick={() => { setSelectedSemesterId(semester.id); setIsOfferingModalOpen(true); }}
                        className="text-sm bg-slate-700 border border-slate-600 text-slate-200 px-3 py-1.5 rounded hover:bg-slate-600 flex items-center gap-2"
                    >
                        <UserPlus size={16} />
                        Alocar
                    </button>
                )}
                <select 
                  value={semester.status}
                  onChange={(e) => updateSemesterStatus(semester.id, e.target.value as any)}
                  className="text-sm bg-slate-700 border-slate-600 text-slate-200 rounded border px-2 py-1.5 focus:outline-none"
                >
                  <option value="planning">Planejamento</option>
                  <option value="active">Ativo</option>
                  <option value="closed">Encerrado</option>
                </select>
              </div>
            </div>

            {/* Content */}
            {expandedSemester === semester.id && (
              <div className="p-4 bg-slate-800 border-t border-slate-700">
                {semester.offerings.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
                    Nenhuma disciplina alocada neste semestre.
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-700">
                        <th className="pb-2 text-left font-medium pl-2">Disciplina</th>
                        <th className="pb-2 text-left font-medium">Professor</th>
                        <th className="pb-2 text-left font-medium">C.H.</th>
                        <th className="pb-2 text-right font-medium pr-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {semester.offerings.map(offer => (
                        <tr key={offer.id} className="hover:bg-slate-700/30">
                          <td className="py-3 pl-2 text-slate-200 font-medium">{getDisciplineName(offer.disciplineId)}</td>
                          <td className="py-3 text-slate-400">{getProfessorName(offer.professorId)}</td>
                          <td className="py-3 text-slate-400">{offer.workload}h</td>
                          <td className="py-3 text-right pr-2">
                             <button 
                                onClick={() => removeOfferingFromSemester(semester.id, offer.id)}
                                className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/20"
                             >
                                <Trash2 size={16} />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal: New Semester */}
      {isSemesterModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-slate-100 mb-4">Criar Semestre</h3>
            <form onSubmit={handleCreateSemester} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Identificação (ex: 2024.2)</label>
                <input required value={newSemesterData.name} onChange={e => setNewSemesterData({...newSemesterData, name: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Início</label>
                  <input type="date" required value={newSemesterData.startDate} onChange={e => setNewSemesterData({...newSemesterData, startDate: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Fim</label>
                  <input type="date" required value={newSemesterData.endDate} onChange={e => setNewSemesterData({...newSemesterData, endDate: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsSemesterModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Offering */}
      {isOfferingModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-slate-100 mb-4">Alocar Disciplina</h3>
            <form onSubmit={handleAddOffering} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Disciplina</label>
                <select 
                    required 
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={offeringData.disciplineId}
                    onChange={e => {
                        const disc = disciplines.find(d => d.id === e.target.value);
                        setOfferingData({
                            ...offeringData, 
                            disciplineId: e.target.value,
                            workload: disc ? disc.defaultWorkload : 60
                        })
                    }}
                >
                    <option value="">Selecione...</option>
                    {disciplines.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Professor (Opcional)</label>
                <select 
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={offeringData.professorId}
                    onChange={e => setOfferingData({...offeringData, professorId: e.target.value})}
                >
                    <option value="">Pendente de atribuição</option>
                    {professors.filter(p => p.active).map(p => <option key={p.id} value={p.id}>{p.name} - {p.titulation}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Carga Horária no Semestre</label>
                <input 
                    type="number" 
                    required 
                    value={offeringData.workload} 
                    onChange={e => setOfferingData({...offeringData, workload: Number(e.target.value)})} 
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsOfferingModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Adicionar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};