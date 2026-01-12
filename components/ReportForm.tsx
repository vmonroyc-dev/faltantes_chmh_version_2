
import React, { useState, useMemo } from 'react';
import { SERVICES, MEDICAL_ITEMS } from '../constants';
import { MedicalItem, Report } from '../types';
import { Button } from './Button';
import { saveReport, savePhysician } from '../services/reportService';

interface ReportFormProps {
  initialPhysicianName: string;
  onSuccess: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ initialPhysicianName, onSuccess }) => {
  const [physicianName, setPhysicianName] = useState(initialPhysicianName);
  const [service, setService] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<MedicalItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado para la captura libre
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customDescription, setCustomDescription] = useState('');
  const [customCategory, setCustomCategory] = useState<'Medicamento' | 'Insumo'>('Medicamento');

  const filteredItems = useMemo(() => {
    const cleanTerm = searchTerm.trim().toLowerCase();
    if (!cleanTerm) return [];
    return MEDICAL_ITEMS.filter(item => 
      item.description.toLowerCase().includes(cleanTerm) ||
      item.code.includes(cleanTerm)
    ).slice(0, 15);
  }, [searchTerm]);

  const toggleItem = (item: MedicalItem) => {
    if (selectedItems.find(i => i.id === item.id)) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const addCustomItem = () => {
    if (!customDescription.trim()) return;
    
    const newItem: MedicalItem = {
      id: `custom-${Math.random().toString(36).substr(2, 9)}`,
      code: 'CAPTURA LIBRE',
      description: customDescription.toUpperCase(),
      presentation: 'N/A',
      category: customCategory
    };
    
    setSelectedItems([...selectedItems, newItem]);
    setCustomDescription('');
    setShowCustomInput(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!physicianName || !service || selectedItems.length === 0) return;

    setIsSubmitting(true);
    const newReport: Report = {
      id: Math.random().toString(36).substr(2, 9),
      physicianName,
      service,
      date: new Date().toLocaleDateString('es-MX'),
      timestamp: Date.now(),
      items: selectedItems
    };
    
    const success = await saveReport(newReport);
    savePhysician(physicianName);
    
    if (success) {
      alert("✅ Reporte guardado en la nube correctamente.");
      setSelectedItems([]);
      setSearchTerm('');
      onSuccess();
    } else {
      alert("⚠️ El reporte se guardó localmente (sin internet). Se sincronizará después.");
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 uppercase">Médico</label>
          <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-300" value={physicianName} onChange={(e) => setPhysicianName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 uppercase">Servicio</label>
          <select required className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white" value={service} onChange={(e) => setService(e.target.value)}>
            <option value="">Selecciona...</option>
            {SERVICES.sort().map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-2 relative">
        <label className="text-sm font-bold text-slate-700 uppercase">Buscador de Insumos/Medicamentos</label>
        <div className="relative">
          <input type="text" className="w-full px-4 py-4 pl-12 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none transition-all" placeholder="Nombre o Clave..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <svg className="w-6 h-6 text-slate-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>

        {searchTerm.length > 0 && (
          <div className="bg-white border rounded-2xl shadow-2xl mt-2 absolute z-30 w-full overflow-hidden divide-y max-h-80 overflow-y-auto">
            {filteredItems.map(item => (
              <div key={item.id} className="p-4 hover:bg-blue-50 cursor-pointer flex justify-between items-center" onClick={() => { toggleItem(item); setSearchTerm(''); }}>
                <div>
                  <p className="font-bold text-slate-800 uppercase">{item.description}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{item.code}</p>
                </div>
                <span className={`text-[8px] font-black p-1 rounded ${item.category === 'Medicamento' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{item.category}</span>
              </div>
            ))}
            
            <div 
              className="p-4 bg-slate-50 hover:bg-slate-100 cursor-pointer flex items-center gap-3 text-blue-600" 
              onClick={() => { setShowCustomInput(true); setSearchTerm(''); }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-black text-xs uppercase tracking-widest">¿No aparece? Capturar opción libre</span>
            </div>
          </div>
        )}
      </div>

      {/* Panel de captura libre */}
      {showCustomInput && (
        <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-black text-blue-700 uppercase tracking-widest">Captura Manual de Faltante</h4>
            <button type="button" onClick={() => setShowCustomInput(false)} className="text-blue-400 hover:text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="DESCRIPCIÓN DEL ARTÍCULO..." 
              className="px-4 py-3 rounded-xl border border-blue-200 outline-none focus:border-blue-500 uppercase font-bold text-sm"
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
            />
            <div className="flex gap-2">
              <select 
                className="flex-1 px-4 py-3 rounded-xl border border-blue-200 outline-none font-bold text-xs uppercase bg-white"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value as any)}
              >
                <option value="Medicamento">Medicamento</option>
                <option value="Insumo">Insumo</option>
              </select>
              <Button type="button" onClick={addCustomItem} className="px-6 py-3 rounded-xl text-xs font-black uppercase shadow-lg shadow-blue-100">
                Añadir
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Seleccionados ({selectedItems.length})</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {selectedItems.map(item => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
              <div className="flex-1 mr-4">
                <p className="text-sm font-bold text-slate-800 uppercase line-clamp-1">{item.description}</p>
                <p className="text-[10px] font-mono text-slate-400">
                  {item.code} {item.id.startsWith('custom-') && <span className="text-blue-500 font-black ml-1">[MANUAL]</span>}
                </p>
              </div>
              <button type="button" onClick={() => toggleItem(item)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
          {selectedItems.length === 0 && (
            <div className="lg:col-span-2 text-center py-8 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No hay artículos seleccionados</p>
            </div>
          )}
        </div>
      </div>

      <Button type="submit" fullWidth disabled={isSubmitting || selectedItems.length === 0} className="py-5 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl">
        {isSubmitting ? 'Guardando en la nube...' : 'Enviar Reporte al Consolidado'}
      </Button>
    </form>
  );
};
