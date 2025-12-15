import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Professor, Discipline, Semester, SemesterDiscipline, ProfessorDocument } from '../types';

interface DataContextType {
  professors: Professor[];
  disciplines: Discipline[];
  semesters: Semester[];
  addProfessor: (prof: Omit<Professor, 'id' | 'documents'>) => void;
  updateProfessor: (prof: Professor) => void;
  addProfessorDocument: (professorId: string, doc: Omit<ProfessorDocument, 'id' | 'uploadDate'>) => void;
  removeProfessorDocument: (professorId: string, docId: string) => void;
  addDiscipline: (disc: Omit<Discipline, 'id'>) => void;
  updateDiscipline: (disc: Discipline) => void;
  addSemester: (sem: Omit<Semester, 'id' | 'offerings'>) => void;
  updateSemester: (sem: Semester) => void;
  updateSemesterStatus: (id: string, status: Semester['status']) => void;
  addOfferingToSemester: (semesterId: string, offering: Omit<SemesterDiscipline, 'id'>) => void;
  removeOfferingFromSemester: (semesterId: string, offeringId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const INITIAL_PROFESSORS: Professor[] = [
  { id: '1', name: 'Dr. João Silva', email: 'joao@uema.br', cpf: '123.456.789-00', titulation: 'Doutor', area: 'Computação', maxWorkload: 40, active: true, documents: [] },
  { id: '2', name: 'Msc. Maria Santos', email: 'maria@uema.br', cpf: '987.654.321-11', titulation: 'Mestre', area: 'Matemática', maxWorkload: 20, active: true, documents: [] },
];

const INITIAL_DISCIPLINES: Discipline[] = [
  { id: '1', name: 'Algoritmos e Programação', code: 'COMP01', defaultWorkload: 60 },
  { id: '2', name: 'Cálculo I', code: 'MAT01', defaultWorkload: 60 },
  { id: '3', name: 'Engenharia de Software', code: 'COMP02', defaultWorkload: 45 },
];

const INITIAL_SEMESTERS: Semester[] = [
  { 
    id: '1', 
    name: '2024.1', 
    status: 'active', 
    startDate: '2024-02-01', 
    endDate: '2024-06-30', 
    offerings: [
      { id: '101', disciplineId: '1', professorId: '1', workload: 60 },
      { id: '102', disciplineId: '2', professorId: '2', workload: 60 }
    ] 
  }
];

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [professors, setProfessors] = useState<Professor[]>(INITIAL_PROFESSORS);
  const [disciplines, setDisciplines] = useState<Discipline[]>(INITIAL_DISCIPLINES);
  const [semesters, setSemesters] = useState<Semester[]>(INITIAL_SEMESTERS);

  const addProfessor = (prof: Omit<Professor, 'id' | 'documents'>) => {
    const newProf: Professor = { ...prof, id: Math.random().toString(36).substr(2, 9), documents: [] };
    setProfessors([...professors, newProf]);
  };

  const updateProfessor = (prof: Professor) => {
    setProfessors(professors.map(p => p.id === prof.id ? prof : p));
  };

  const addProfessorDocument = (professorId: string, doc: Omit<ProfessorDocument, 'id' | 'uploadDate'>) => {
    const newDoc: ProfessorDocument = {
        ...doc,
        id: Math.random().toString(36).substr(2, 9),
        uploadDate: new Date().toISOString()
    };
    setProfessors(professors.map(p => {
        if (p.id === professorId) {
            return { ...p, documents: [...p.documents, newDoc] };
        }
        return p;
    }));
  };

  const removeProfessorDocument = (professorId: string, docId: string) => {
    setProfessors(professors.map(p => {
        if (p.id === professorId) {
            return { ...p, documents: p.documents.filter(d => d.id !== docId) };
        }
        return p;
    }));
  };

  const addDiscipline = (disc: Omit<Discipline, 'id'>) => {
    const newDisc = { ...disc, id: Math.random().toString(36).substr(2, 9) };
    setDisciplines([...disciplines, newDisc]);
  };

  const updateDiscipline = (disc: Discipline) => {
    setDisciplines(disciplines.map(d => d.id === disc.id ? disc : d));
  };

  const addSemester = (sem: Omit<Semester, 'id' | 'offerings'>) => {
    const newSem: Semester = { ...sem, id: Math.random().toString(36).substr(2, 9), offerings: [] };
    setSemesters([...semesters, newSem]);
  };

  const updateSemester = (sem: Semester) => {
    setSemesters(semesters.map(s => s.id === sem.id ? sem : s));
  };

  const updateSemesterStatus = (id: string, status: Semester['status']) => {
    setSemesters(semesters.map(s => s.id === id ? { ...s, status } : s));
  };

  const addOfferingToSemester = (semesterId: string, offering: Omit<SemesterDiscipline, 'id'>) => {
    const newOffering = { ...offering, id: Math.random().toString(36).substr(2, 9) };
    setSemesters(semesters.map(s => {
      if (s.id === semesterId) {
        return { ...s, offerings: [...s.offerings, newOffering] };
      }
      return s;
    }));
  };

  const removeOfferingFromSemester = (semesterId: string, offeringId: string) => {
    setSemesters(semesters.map(s => {
      if (s.id === semesterId) {
        return { ...s, offerings: s.offerings.filter(o => o.id !== offeringId) };
      }
      return s;
    }));
  };

  return (
    <DataContext.Provider value={{
      professors, disciplines, semesters,
      addProfessor, updateProfessor,
      addProfessorDocument, removeProfessorDocument,
      addDiscipline, updateDiscipline,
      addSemester, updateSemester, updateSemesterStatus,
      addOfferingToSemester, removeOfferingFromSemester
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};