
import React from 'react';
import { Download, Upload, Database, ShieldCheck, FileJson, Calendar as CalendarIcon, FileUp, LogOut } from 'lucide-react';
import { clearAllData } from '../utils/dataManager';

interface DataViewProps {
  handleSaveData: () => void;
  handleLoadData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DataView: React.FC<DataViewProps> = ({ 
    handleSaveData, 
    handleLoadData, 
}) => {
    return (
      <div className="flex flex-col h-full bg-white p-12 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-lg shadow-blue-100/50">
                    <Database size={24} strokeWidth={2.5}/>
                </div>
                <span className="text-sm font-black text-blue-600 uppercase tracking-[0.3em]">Infrastructure</span>
            </div>
            <h2 className="text-6xl font-black text-slate-900 tracking-tighter mb-16 leading-tight">Persistence & Data</h2>
            
            <div className="grid md:grid-cols-2 gap-10 mb-10">
                <div 
                    onClick={handleSaveData}
                    className="group bg-slate-50 border-2 border-slate-50 p-10 rounded-[2.5rem] cursor-pointer hover:border-blue-600 hover:bg-white hover:shadow-2xl transition-all duration-500"
                >
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xl shadow-blue-100/50">
                        <Download size={32}/>
                    </div>
                    <h3 className="font-black text-2xl text-slate-900 mb-3 tracking-tight">Export Global State</h3>
                    <p className="text-slate-500 font-bold leading-relaxed text-sm">Download a high-fidelity JSON archive of all habits, events, emails, and life goals.</p>
                </div>

                <div className="group bg-slate-50 border-2 border-slate-50 p-10 rounded-[2.5rem] relative hover:border-emerald-600 hover:bg-white hover:shadow-2xl transition-all duration-500">
                    <input 
                        type="file" 
                        onChange={handleLoadData} 
                        accept=".json" 
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    />
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-8 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xl shadow-emerald-100/50">
                        <Upload size={32}/>
                    </div>
                    <h3 className="font-black text-2xl text-slate-900 mb-3 tracking-tight">Restore Local State</h3>
                    <p className="text-slate-500 font-bold leading-relaxed text-sm">Upload an archive file to instantly override current workspace with past data points.</p>
                </div>
            </div>
            <div className="grid md:grid-cols-1 gap-10 mb-20">
                <div 
                    className="group bg-slate-50 border-2 border-slate-50 p-12 rounded-[2.5rem] cursor-not-allowed opacity-60 flex items-center gap-10"
                >
                    <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-100/50 flex-shrink-0">
                        <FileUp size={40}/>
                    </div>
                    <div>
                        <h3 className="font-black text-2xl text-slate-900 mb-3 tracking-tight uppercase">Integrate iCal (.ics)</h3>
                        <p className="text-slate-500 font-bold leading-relaxed text-sm">iCal import coming soon - will merge external calendars (Google, Outlook, Apple) into your week timeline seamlessly.</p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 text-white rounded-[3rem] p-12 flex flex-col md:flex-row items-center gap-10 border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center border-2 border-blue-500/30 flex-shrink-0">
                    <ShieldCheck size={48} className="text-blue-400"/>
                </div>
                <div className="flex-1 relative z-10 text-center md:text-left">
                    <h3 className="text-3xl font-black mb-3 tracking-tighter">Zero-Knowledge Storage</h3>
                    <p className="text-slate-400 font-bold leading-relaxed">OmniPlan operates on a 100% client-side logic. Your high-performance dashboard, habits, and secrets never touch our infrastructure.</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => {
                            if (window.confirm("CRITICAL WARNING: This will permanently purge your local Life OS data. This action is irreversible. Continue?")) {
                                clearAllData();
                                window.location.reload();
                            }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-12 py-5 rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl shadow-red-200 active:scale-95 whitespace-nowrap"
                    >
                        Nuke Workspace
                    </button>
                    <button 
                        onClick={() => {
                            const { ipcRenderer } = window.require('electron');
                            ipcRenderer.send('quit-app');
                        }}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-5 rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl shadow-slate-900/50 active:scale-95 whitespace-nowrap flex items-center gap-2"
                    >
                        <LogOut size={16}/>
                        Exit Program
                    </button>
                </div>
            </div>
            
            <div className="mt-20 pt-16 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="flex flex-col items-center text-center p-8 bg-slate-50 rounded-[2.5rem]">
                    <FileJson className="text-slate-300 mb-5" size={40}/>
                    <div className="text-sm font-black text-slate-900 uppercase tracking-widest">v2.0.0 Protocol</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-2">Week-Isolated Persistence</div>
                </div>
                <div className="flex flex-col items-center text-center p-8 bg-slate-50 rounded-[2.5rem]">
                    <CalendarIcon className="text-slate-300 mb-5" size={40}/>
                    <div className="text-sm font-black text-slate-900 uppercase tracking-widest">Real-Time Sync</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-2">Month & Week Unified</div>
                </div>
                <div className="flex flex-col items-center text-center p-8 bg-slate-50 rounded-[2.5rem]">
                    <ShieldCheck className="text-slate-300 mb-5" size={40}/>
                    <div className="text-sm font-black text-slate-900 uppercase tracking-widest">Privacy First</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-2">Local Sandbox</div>
                </div>
            </div>
        </div>
      </div>
    );
};
