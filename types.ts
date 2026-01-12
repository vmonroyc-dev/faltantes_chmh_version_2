
export interface MedicalItem {
  id: string;
  code: string;
  description: string;
  presentation: string;
  category: 'Medicamento' | 'Insumo';
}

export interface Report {
  id: string;
  physicianName: string;
  service: string;
  date: string;
  timestamp: number;
  items: MedicalItem[];
}

export type ViewType = 'form' | 'admin';

export interface AppState {
  reports: Report[];
  currentPhysician: string;
  view: ViewType;
  isAuthenticated: boolean;
}
