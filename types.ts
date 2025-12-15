export interface User {
  id: string;
  name: string;
  email: string;
  role: 'secretary' | 'admin';
  department: string;
}

export interface ProfessorDocument {
  id: string;
  name: string;
  type: string; // 'pdf', 'image', etc.
  uploadDate: string;
  dataUrl: string; // Base64 content
}

export interface Professor {
  id: string;
  name: string;
  email: string;
  cpf: string;
  titulation: 'Graduado' | 'Especialista' | 'Mestre' | 'Doutor';
  area: string;
  maxWorkload: number;
  active: boolean;
  documents: ProfessorDocument[];
}

export interface Discipline {
  id: string;
  name: string;
  code: string;
  defaultWorkload: number;
}

export interface SemesterDiscipline {
  id: string;
  disciplineId: string;
  professorId: string | null;
  workload: number; // Actual workload for this specific semester offering
}

export interface Semester {
  id: string;
  name: string; // e.g., "2024.1"
  status: 'planning' | 'active' | 'closed';
  startDate: string;
  endDate: string;
  offerings: SemesterDiscipline[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  attachmentName?: string;
}