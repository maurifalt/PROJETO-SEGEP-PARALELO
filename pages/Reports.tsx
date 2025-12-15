import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { FileDown, Filter } from 'lucide-react';

export const Reports: React.FC = () => {
  const { professors, semesters, disciplines } = useData();
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(semesters[0]?.id || '');

  // Consolidate Data
  const reportData = professors.map(prof => {
    const semester = semesters.find(s => s.id === selectedSemesterId);
    if (!semester) return null;

    const offerings = semester.offerings.filter(o => o.professorId === prof.id);
    if (offerings.length === 0) return null;

    const totalHours = offerings.reduce((acc, curr) => acc + curr.workload, 0);
    const disciplineNames = offerings
        .map(o => disciplines.find(d => d.id === o.disciplineId)?.name)
        .filter(Boolean)
        .join(', ');

    return {
      professorName: prof.name,
      titulation: prof.titulation,
      disciplines: disciplineNames,
      totalHours: totalHours
    };
  }).filter(Boolean); // Remove nulls

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 print:hidden">
        <h2 className="text-2xl font-bold text-slate-100">Relatório Financeiro (Consolidado)</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
            <Filter size={16} className="text-slate-400" />
            <select 
              value={selectedSemesterId}
              onChange={(e) => setSelectedSemesterId(e.target.value)}
              className="bg-transparent text-sm text-slate-200 outline-none"
            >
              {semesters.map(s => <option key={s.id} value={s.id} className="text-slate-900">{s.name}</option>)}
            </select>
          </div>
          <button 
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <FileDown size={18} />
            Imprimir
          </button>
        </div>
      </div>

      <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700 print:shadow-none print:border-none print:p-0 print:bg-white print:text-black">
        <div className="mb-8 text-center hidden print:block">
            <h1 className="text-xl font-bold uppercase mb-1">Universidade Estadual do Maranhão - UEMA</h1>
            <h2 className="text-lg font-medium mb-4">Programa Profitec - Relatório de Carga Horária</h2>
            <p className="text-sm text-slate-600">Semestre de Referência: {semesters.find(s => s.id === selectedSemesterId)?.name}</p>
        </div>

        {reportData.length === 0 ? (
           <div className="text-center py-12 text-slate-500 print:text-black">
             Nenhum registro encontrado para o semestre selecionado.
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-700 print:border-slate-300">
              <thead className="bg-slate-900/50 print:bg-slate-100">
                <tr>
                  <th className="border border-slate-700 print:border-slate-300 p-3 text-left text-sm font-semibold text-slate-300 print:text-slate-700">Professor</th>
                  <th className="border border-slate-700 print:border-slate-300 p-3 text-left text-sm font-semibold text-slate-300 print:text-slate-700">Titulação</th>
                  <th className="border border-slate-700 print:border-slate-300 p-3 text-left text-sm font-semibold text-slate-300 print:text-slate-700 w-1/2">Disciplinas Ministradas</th>
                  <th className="border border-slate-700 print:border-slate-300 p-3 text-center text-sm font-semibold text-slate-300 print:text-slate-700">C.H. Total</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-700/30 print:hover:bg-transparent">
                    <td className="border border-slate-700 print:border-slate-300 p-3 text-sm text-slate-200 print:text-slate-800 font-medium">{row?.professorName}</td>
                    <td className="border border-slate-700 print:border-slate-300 p-3 text-sm text-slate-400 print:text-slate-600">{row?.titulation}</td>
                    <td className="border border-slate-700 print:border-slate-300 p-3 text-sm text-slate-400 print:text-slate-600">{row?.disciplines}</td>
                    <td className="border border-slate-700 print:border-slate-300 p-3 text-sm text-slate-200 print:text-slate-800 text-center font-bold">{row?.totalHours}h</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-900/50 print:bg-slate-50 font-semibold">
                  <tr>
                      <td colSpan={3} className="border border-slate-700 print:border-slate-300 p-3 text-right text-sm text-slate-300 print:text-slate-700">Total Geral de Horas:</td>
                      <td className="border border-slate-700 print:border-slate-300 p-3 text-center text-sm text-slate-100 print:text-slate-900">
                          {reportData.reduce((acc, curr) => acc + (curr?.totalHours || 0), 0)}h
                      </td>
                  </tr>
              </tfoot>
            </table>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-slate-700 print:border-slate-300 text-xs text-slate-500 print:text-slate-500 hidden print:block">
            <p>Gerado pelo sistema SIGEP em {new Date().toLocaleDateString()}. Este documento não serve como comprovante de pagamento.</p>
        </div>
      </div>
    </div>
  );
};