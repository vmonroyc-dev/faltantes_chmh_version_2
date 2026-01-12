
import React, { useState, useEffect } from 'react';
import { Report } from '../types';
import { getReports, deleteReport } from '../services/reportService';
import { Button } from './Button';
import * as XLSX from 'xlsx';

export const AdminDashboard: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    const data = await getReports();
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Está seguro de eliminar este registro permanentemente del histórico?")) return;
    
    const success = await deleteReport(id);
    if (success) {
      setReports(reports.filter(r => r.id !== id));
    } else {
      alert("Error al intentar eliminar el registro.");
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredReports.flatMap(report => 
      report.items.map(item => ({
        "FECHA": report.date,
        "SERVICIO": report.service,
        "MÉDICO": report.physicianName,
        "CLAVE": item.code,
        "DESCRIPCIÓN": item.description,
        "PRESENTACIÓN": item.presentation,
        "CATEGORÍA": item.category
      }))
    );

    if (dataToExport.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "HISTORICO");
    XLSX.writeFile(workbook, `LOG_CHMH_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredReports = reports.filter(r => {
    const term = searchTerm.toLowerCase();
    return (
      r.service.toLowerCase().includes(term) ||
      r.physicianName.toLowerCase().includes(term) ||
      r.items.some(i => i.description.toLowerCase().includes(term) || i.code.includes(term))
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Bitácora en la Nube</h2>
          <p className="text-slate-400 font-bold text-xs tracking-widest mt-1">Sincronizado en tiempo real</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchReports} variant="secondary" className="px-6 py-3 rounded-2xl text-xs font-black uppercase">
            Actualizar
          </Button>
          <Button onClick={exportToExcel} variant="primary" className="shadow-lg shadow-blue-100 px-6 py-3 rounded-2xl text-xs font-black uppercase">
            Excel
          </Button>
        </div>
      </div>

      <div className="relative group">
        <input 
          type="text" 
          placeholder="BUSCAR EN TODA LA BASE DE DATOS..." 
          className="w-full px-6 py-5 pl-14 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <svg className="w-6 h-6 text-slate-300 absolute left-5 top-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Conectando a la nube...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold text-sm uppercase">No se encontraron reportes</p>
            </div>
          ) : filteredReports.map((report) => (
            <div key={report.id} className="bg-white border border-slate-100 rounded-3xl p-6 hover:shadow-xl transition-all relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pr-12">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">{report.service}</div>
                  <p className="text-slate-800 font-black text-sm uppercase">{report.physicianName}</p>
                </div>
                <span className="text-slate-400 font-bold text-xs">{report.date}</span>
              </div>
              
              <button 
                onClick={() => handleDelete(report.id)}
                className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 transition-colors"
                title="Eliminar registro"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {report.items.map(item => (
                  <div key={item.id} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4">
                    <p className="text-xs font-black text-slate-800 uppercase line-clamp-1">{item.description}</p>
                    <p className="text-[10px] font-mono text-slate-400 font-bold">
                      {item.code || 'SIN CLAVE'} 
                      {item.id.startsWith('custom-') && <span className="ml-2 text-blue-500 text-[8px] font-black tracking-widest">[LIBRE]</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
