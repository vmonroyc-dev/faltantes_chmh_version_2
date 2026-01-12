
import { createClient } from '@supabase/supabase-js';
import { Report } from '../types';

// CONFIGURACIÓN DE NUBE
const SUPABASE_URL = 'https://pvuekidkratizjbbtwuj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_jCbvRV9SD_U1XS4o8vv6Rw_NevQHDa1';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PHYSICIAN_KEY = 'hidalgo_hospital_current_physician';

/**
 * Guarda un reporte en la base de datos de la nube
 */
export const saveReport = async (report: Report): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('reports')
      .insert([
        { 
          id: report.id,
          physician_name: report.physicianName,
          service: report.service,
          date: report.date,
          timestamp: report.timestamp,
          items: JSON.stringify(report.items)
        }
      ]);

    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Error guardando en nube, usando respaldo local:", e);
    const localData = localStorage.getItem('backup_reports') || '[]';
    const reports = JSON.parse(localData);
    localStorage.setItem('backup_reports', JSON.stringify([report, ...reports]));
    return false;
  }
};

/**
 * Obtiene todos los reportes desde la nube
 */
export const getReports = async (): Promise<Report[]> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;

    return data.map(r => ({
      id: r.id,
      physicianName: r.physician_name,
      service: r.service,
      date: r.date,
      timestamp: r.timestamp,
      items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items
    }));
  } catch (e) {
    console.error("Error cargando de la nube:", e);
    return [];
  }
};

/**
 * Elimina un reporte de la nube
 */
export const deleteReport = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Error eliminando registro:", e);
    return false;
  }
};

export const savePhysician = (name: string) => {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(PHYSICIAN_KEY, JSON.stringify({ name, date: today }));
};

export const getStoredPhysician = (): string | null => {
  const data = localStorage.getItem(PHYSICIAN_KEY);
  if (!data) return null;
  try {
    const { name, date } = JSON.parse(data);
    if (date !== new Date().toISOString().split('T')[0]) return null;
    return name;
  } catch (e) { return null; }
};
