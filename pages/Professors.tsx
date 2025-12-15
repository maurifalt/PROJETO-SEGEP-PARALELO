import React, { useState, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { Professor } from '../types';
import { Plus, Edit2, Search, UserCircle, FileText, Trash2, Upload, Download, FileSpreadsheet } from 'lucide-react';

export const Professors: React.FC = () => {
  const { professors, addProfessor, updateProfessor, addProfessorDocument, removeProfessorDocument } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProf, setEditingProf] = useState<Professor | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'docs'>('info');
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Professor, 'id' | 'documents'>>({
    name: '',
    email: '',
    cpf: '',
    titulation: 'Mestre',
    area: '',
    maxWorkload: 40,
    active: true
  });

  const handleOpenModal = (prof?: Professor) => {
    setActiveTab('info');
    if (prof) {
      setEditingProf(prof);
      setFormData({ 
          name: prof.name,
          email: prof.email,
          cpf: prof.cpf,
          titulation: prof.titulation,
          area: prof.area,
          maxWorkload: prof.maxWorkload,
          active: prof.active
       });
    } else {
      setEditingProf(null);
      setFormData({
        name: '', email: '', cpf: '', titulation: 'Mestre', area: '', maxWorkload: 40, active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProf) {
      updateProfessor({ ...formData, id: editingProf.id, documents: editingProf.documents });
    } else {
      addProfessor(formData);
    }
    setIsModalOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingProf) {
        const reader = new FileReader();
        reader.onloadend = () => {
            addProfessorDocument(editingProf.id, {
                name: file.name,
                type: file.type,
                dataUrl: reader.result as string
            });
        };
        reader.readAsDataURL(file);
    }
  };

  const handleExportCSV = () => {
    const headers = "Nome,Email,CPF,Titulação,Área,Carga Máxima,Status,Documentos\n";
    const rows = professors.map(p => 
      `"${p.name}","${p.email}","${p.cpf}","${p.titulation}","${p.area}",${p.maxWorkload},${p.active ? 'Ativo' : 'Inativo'},${p.documents.length}`
    ).join("\n");
    
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "professores_sigep.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentEditingProf = editingProf ? professors.find(p => p.id === editingProf.id) : null;

  const filteredProfs = professors.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-100">Gerenciar Professores</h2>
        <div className="flex gap-2">
            <button 
            onClick={handleExportCSV}
            className="bg-slate-700 text-slate-200 border border-slate-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-600 transition shadow-sm"
            title="Exportar para Excel/CSV"
            >
            <FileSpreadsheet size={18} />
            Exportar
            </button>
            <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-sm"
            >
            <Plus size={18} />
            Novo Professor
            </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou área..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfs.map(prof => (
          <div key={prof.id} className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg hover:border-slate-600 transition p-6 relative group">
            <button 
                onClick={() => handleOpenModal(prof)}
                className="absolute top-4 right-4 text-slate-400 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Edit2 size={18} />
            </button>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-blue-400 border border-slate-600">
                <UserCircle size={28} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100">{prof.name}</h3>
                <p className="text-xs text-slate-400">{prof.email}</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex justify-between border-b border-slate-700/50 pb-2">
                <span>Titulação:</span>
                <span className="font-medium text-slate-200">{prof.titulation}</span>
              </div>
              <div className="flex justify-between border-b border-slate-700/50 pb-2">
                <span>Área:</span>
                <span className="font-medium text-slate-200">{prof.area}</span>
              </div>
              <div className="flex justify-between border-b border-slate-700/50 pb-2">
                <span>Carga Máx:</span>
                <span className="font-medium text-slate-200">{prof.maxWorkload}h</span>
              </div>
              <div className="flex justify-between pt-1">
                <div className="flex items-center gap-1 text-xs">
                    <FileText size={12}/> {prof.documents.length} Docs
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${prof.active ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
                    {prof.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-700 animate-in fade-in zoom-in duration-200">
            
            <div className="flex border-b border-slate-700">
                <button 
                    onClick={() => setActiveTab('info')}
                    className={`flex-1 p-4 text-sm font-medium transition ${activeTab === 'info' ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800' : 'text-slate-400 bg-slate-900/50 hover:bg-slate-800'}`}
                >
                    Informações Pessoais
                </button>
                <button 
                    onClick={() => setActiveTab('docs')}
                    disabled={!editingProf} // Disable docs for new users until saved
                    className={`flex-1 p-4 text-sm font-medium transition ${activeTab === 'docs' ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800' : 'text-slate-400 bg-slate-900/50 hover:bg-slate-800'} ${!editingProf ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Documentos ({currentEditingProf?.documents.length || 0})
                </button>
            </div>

            <div className="p-6">
                {activeTab === 'info' ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-100 mb-4">
                        {editingProf ? 'Editar Professor' : 'Novo Professor'}
                        </h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Nome Completo</label>
                            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">CPF</label>
                            <input required value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Titulação</label>
                            <select 
                                value={formData.titulation} 
                                onChange={e => setFormData({...formData, titulation: e.target.value as any})}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="Graduado">Graduado</option>
                                <option value="Especialista">Especialista</option>
                                <option value="Mestre">Mestre</option>
                                <option value="Doutor">Doutor</option>
                            </select>
                            </div>
                            <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Área</label>
                            <input required value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Carga Horária Máxima (h)</label>
                            <input type="number" required value={formData.maxWorkload} onChange={e => setFormData({...formData, maxWorkload: Number(e.target.value)})} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        
                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700">Cancelar</button>
                            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Salvar</button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                         <div className="flex justify-between items-center mb-2">
                             <h3 className="text-lg font-bold text-slate-100">Documentos</h3>
                             <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded flex items-center gap-2 hover:bg-blue-700 transition"
                             >
                                <Upload size={14} /> Upload PDF/Img
                             </button>
                             <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept=".pdf,image/*"
                                onChange={handleFileUpload}
                             />
                         </div>

                         <div className="bg-slate-900 rounded-lg border border-slate-700 h-64 overflow-y-auto p-2 space-y-2">
                            {currentEditingProf?.documents.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                                    <FileText size={32} className="mb-2 opacity-50"/>
                                    Nenhum documento anexado.
                                </div>
                            )}
                            {currentEditingProf?.documents.map(doc => (
                                <div key={doc.id} className="bg-slate-800 p-3 rounded border border-slate-700 flex items-center justify-between group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-blue-400 shrink-0">
                                            <FileText size={16} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm text-slate-200 truncate">{doc.name}</p>
                                            <p className="text-xs text-slate-500">{new Date(doc.uploadDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <a href={doc.dataUrl} download={doc.name} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded transition" title="Baixar">
                                            <Download size={16} />
                                        </a>
                                        <button 
                                            onClick={() => removeProfessorDocument(currentEditingProf.id, doc.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition"
                                            title="Remover"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                         </div>
                         <div className="pt-2">
                             <button type="button" onClick={() => setIsModalOpen(false)} className="w-full px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700">Fechar</button>
                         </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};