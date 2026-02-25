
import React, { useState } from 'react';
import { Mail, ChevronLeft, Search, Archive, Trash2, CheckCircle } from 'lucide-react';
import { Email } from '../types';

interface EmailViewProps {
  emails: Email[];
  setEmails: React.Dispatch<React.SetStateAction<Email[]>>;
}

export const EmailView: React.FC<EmailViewProps> = ({ emails, setEmails }) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedEmail = emails.find(e => e.id === selectedId);

  const markRead = (id: number) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, read: true } : e));
    setSelectedId(id);
  };

  const deleteEmail = (id: number) => {
    setEmails(prev => prev.filter(e => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div className="flex h-full bg-white relative">
      <div className={`${selectedId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 border-r border-slate-200`}>
        <div className="p-6 border-b border-slate-200">
           <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Inbox</h2>
           <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={16}/>
              <input className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500" placeholder="Search correspondence..." />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto">
            {emails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 p-10 text-center">
                    <CheckCircle className="text-emerald-500 mb-2" size={32} />
                    <p className="text-slate-500 font-bold text-sm">Inbox Zero Achieved!</p>
                </div>
            ) : emails.map(email => (
                <div 
                    key={email.id} 
                    onClick={() => markRead(email.id)} 
                    className={`p-5 border-b border-slate-100 cursor-pointer hover:bg-blue-50 transition-colors relative ${!email.read ? 'bg-white' : 'bg-slate-50/50'}`}
                >
                    {!email.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>}
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-bold ${!email.read ? 'text-slate-900' : 'text-slate-500'}`}>{email.sender}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{email.time}</span>
                    </div>
                    <div className={`text-[13px] truncate ${!email.read ? 'text-slate-800 font-semibold' : 'text-slate-500 font-medium'}`}>{email.subject}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-1">{email.preview}</div>
                </div>
            ))}
        </div>
      </div>
      
      <div className={`${selectedId ? 'flex' : 'hidden md:flex'} flex-col w-full flex-1 bg-white`}>
        {selectedEmail ? (
          <div className="p-8 flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                  <button onClick={() => setSelectedId(null)} className="md:hidden text-blue-600 flex items-center gap-1 font-bold text-sm">
                      <ChevronLeft size={16} /> Back
                  </button>
                  <div className="flex gap-4">
                      <button onClick={() => deleteEmail(selectedEmail.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={20}/>
                      </button>
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <Archive size={20}/>
                      </button>
                  </div>
              </div>
              <div className="max-w-2xl">
                <h1 className="text-3xl font-black text-slate-900 mb-6 leading-tight">{selectedEmail.subject}</h1>
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                        {selectedEmail.sender[0]}
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-900">{selectedEmail.sender}</div>
                        <div className="text-xs text-slate-500">To: you@omniplan.ai</div>
                    </div>
                </div>
                <div className="text-slate-700 leading-relaxed whitespace-pre-line text-lg font-medium">
                    {selectedEmail.body}
                </div>
              </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-10 text-center">
            <Mail size={64} strokeWidth={1} className="mb-4 opacity-20"/>
            <p className="text-xl font-bold text-slate-400">Select a message to read</p>
          </div>
        )}
      </div>
    </div>
  );
};
