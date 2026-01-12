
import React, { useState, useEffect } from 'react';
import { HOSPITAL_NAME, ADMIN_PASSWORD } from './constants';
import { ViewType } from './types';
import { getStoredPhysician } from './services/reportService';
import { ReportForm } from './components/ReportForm';
import { AdminDashboard } from './components/AdminDashboard';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('form');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [physicianName, setPhysicianName] = useState('');
  const [showPassModal, setShowPassModal] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const stored = getStoredPhysician();
    if (stored) setPhysicianName(stored);
  }, []);

  const handleAdminAccess = () => {
    if (isAuthenticated) {
      setView('admin');
    } else {
      setShowPassModal(true);
    }
  };

  const handleShare = async () => {
    // Aseguramos que el URL sea absoluto y correcto
    const url = window.location.origin + window.location.pathname;
    
    const shareData = {
      title: 'Reporte Faltantes CHMH',
      text: 'Acceso al formulario de reporte de insumos del Hospital Hidalgo.',
      url: url
    };

    try {
      // Intento 1: Web Share API (Móviles)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return;
      }
      
      // Intento 2: Clipboard API (Escritorio / WebView)
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 4000);
    } catch (err) {
      // Intento 3: Fallback manual por si todo falla
      const dummy = document.createElement('input');
      document.body.appendChild(dummy);
      dummy.value = url;
      dummy.select();
      document.execCommand('copy');
      document.body.removeChild(dummy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 4000);
      console.warn('Share API falló, usando portapapeles manual:', err);
    }
  };

  const verifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setView('admin');
      setShowPassModal(false);
      setPassInput('');
    } else {
      alert("Llave de acceso incorrecta.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tighter">
                {HOSPITAL_NAME}
              </h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Abasto Pediátrico</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <button 
              onClick={handleShare}
              title="Compartir enlace con otros jefes de servicio"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 border-2 ${
                copySuccess 
                ? 'bg-green-50 border-green-500 text-green-600' 
                : 'bg-white border-slate-100 text-slate-600 hover:border-blue-500 hover:text-blue-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {copySuccess ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                )}
              </svg>
              {copySuccess ? 'ENLACE COPIADO' : 'COMPARTIR APP'}
            </button>
            <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden md:block"></div>
            <Button 
              variant={view === 'form' ? 'primary' : 'ghost'} 
              onClick={() => setView('form')}
              className="text-xs px-5 font-black"
            >
              REPORTAR
            </Button>
            <Button 
              variant={view === 'admin' ? 'primary' : 'secondary'} 
              onClick={handleAdminAccess}
              className="text-xs px-5 font-black"
            >
              HISTÓRICO
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-6 md:py-10">
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {view === 'form' ? (
            <div className="p-6 md:p-12">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Registro de Faltante</h2>
                <p className="text-slate-500 mt-2 font-medium italic">Seleccione los artículos de los PDFs que presentan desabasto hoy.</p>
              </div>
              <ReportForm 
                initialPhysicianName={physicianName} 
                onSuccess={() => {
                  const stored = getStoredPhysician();
                  if (stored) setPhysicianName(stored);
                }}
              />
            </div>
          ) : (
            <div className="p-6 md:p-12">
              <AdminDashboard />
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 text-center">
        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.3em]">
          CHMH • Dirección de Servicios Médicos • 2026
        </p>
      </footer>

      {/* Login Modal */}
      {showPassModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-blue-600 p-8 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-white text-xl font-black uppercase tracking-tight">Panel Administrativo</h3>
            </div>
            <form onSubmit={verifyPassword} className="p-8 space-y-6">
              <input 
                type="password" 
                autoFocus
                placeholder="CLAVE"
                className="w-full px-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-0 outline-none text-center text-2xl tracking-[0.5em] transition-all font-mono placeholder:tracking-normal placeholder:text-sm placeholder:font-sans"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
              />
              <div className="flex flex-col gap-2">
                <Button type="submit" variant="primary" fullWidth className="py-4 shadow-lg shadow-blue-200 uppercase font-black tracking-widest text-xs">
                  Entrar a Bitácora
                </Button>
                <button 
                  type="button" 
                  onClick={() => setShowPassModal(false)}
                  className="text-slate-400 text-[10px] font-bold uppercase py-2 hover:text-slate-600 transition-colors"
                >
                  Regresar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
