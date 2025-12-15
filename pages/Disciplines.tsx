import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Discipline } from '../types';
import { Plus, Edit2, Book } from 'lucide-react';

export const Disciplines: React.FC = () => {
  const { disciplines, addDiscipline, updateDiscipline } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDisc, setEditingDisc] = useState<Discipline | null>(null);

  const [formData, setFormData] = useState<Omit<Discipline, 'id'>>({
    name: '',
    code: '',
    defaultWorkload: 60
  });

  const handleOpenModal = (disc?: Discipline) => {
    if (disc) {
      setEditingDisc(disc);
      setFormData({ ...disc });
    } else {
      setEditingDisc(null);
      setFormData({ name: '', code: '', defaultWorkload: 60 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDisc) {
      updateDiscipline({ ...formData, id: editingDisc.id });
    } else {
      addDiscipline(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-100">Disciplinas</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          Nova Disciplina
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="p-4 text-sm font-semibold text-slate-400 border-b border-slate-700">Código</th>
              <th className="p-4 text-sm font-semibold text-slate-400 border-b border-slate-700">Nome</th>
              <th className="p-4 text-sm font-semibold text-slate-400 border-b border-slate-700">Carga Horária Padrão</th>
              <th className="p-4 text-sm font-semibold text-slate-400 border-b border-slate-700">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {disciplines.map(disc => (
              <tr key={disc.id} className="hover:bg-slate-700/50 transition-colors">
                <td className="p-4 text-sm font-mono text-slate-500">{disc.code}</td>
                <td className="p-4 text-sm text-slate-200 font-medium">
                  <div className="flex items-center gap-2">
                    <Book size={16} className="text-blue-500" />
                    {disc.name}
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-400">{disc.defaultWorkload}h</td>
                <td className="p-4">
                  <button onClick={() => handleOpenModal(disc)} className="text-blue-400 hover:bg-slate-700 p-2 rounded-lg transition">
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {disciplines.length === 0 && (
          <div className="p-8 text-center text-slate-500">Nenhuma disciplina cadastrada.</div>
        )}
      </div>

       {/* Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-slate-100 mb-4">
              {editingDisc ? 'Editar Disciplina' : 'Nova Disciplina'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nome da Disciplina</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Código</label>
                  <input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="EX: MAT01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">C.H. (Horas)</label>
                  <input type="number" required value={formData.defaultWorkload} onChange={e => setFormData({...formData, defaultWorkload: Number(e.target.value)})} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};