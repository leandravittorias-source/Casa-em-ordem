/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppState, CriticalContact, LostObject, BorrowedItem, DelegationMission } from '../types';
import { 
  Plus, Trash2, Edit2, ShieldAlert, Key, HelpCircle, 
  Settings, CheckSquare, Wrench, FileText, ChevronRight, Calendar, 
  MapPin, Check, Save, Info, Users, Archive, Landmark, ClipboardList, Trash, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CriticalMemoryViewProps {
  state: AppState;
  addCriticalContact: (title: string, value: string, category: CriticalContact['category']) => void;
  editCriticalContact: (id: string, title: string, value: string, category: CriticalContact['category']) => void;
  deleteCriticalContact: (id: string) => void;
  addLostObject: (name: string, lastSeenLocation: string) => void;
  editLostObject: (id: string, name: string, lastSeenLocation: string) => void;
  deleteLostObject: (id: string) => void;
  addBorrowedItem: (name: string, personName: string, type: BorrowedItem['type'], date: string) => void;
  toggleBorrowedItemReturned: (id: string) => void;
  editBorrowedItem: (id: string, name: string, personName: string, type: BorrowedItem['type'], date: string) => void;
  deleteBorrowedItem: (id: string) => void;
  addMission: (mission: Omit<DelegationMission, 'id' | 'createdAt'>) => void;
  deleteMission: (id: string) => void;
  toggleMissionTask: (missionId: string, taskId: string) => void;
  editMission: (id: string, updatedFields: Partial<DelegationMission>) => void;
}

export default function CriticalMemoryView({
  state, addCriticalContact, editCriticalContact, deleteCriticalContact,
  addLostObject, editLostObject, deleteLostObject, addBorrowedItem, toggleBorrowedItemReturned,
  editBorrowedItem, deleteBorrowedItem, addMission, deleteMission, toggleMissionTask, editMission
}: CriticalMemoryViewProps) {

  // Selected tab: vault, lost, favors, delegation missions
  const [activeTab, setActiveTab] = useState<'vault' | 'lost' | 'loans' | 'missions'>('vault');

  // Form states - Vault info
  const [vaultTitle, setVaultTitle] = useState('');
  const [vaultValue, setVaultValue] = useState('');
  const [vaultCat, setVaultCat] = useState<CriticalContact['category']>('emergência');

  // Lost obj tracker
  const [lostName, setLostName] = useState('');
  const [lostLoc, setLostLoc] = useState('');

  // Loan log
  const [loanName, setLoanName] = useState('');
  const [loanPerson, setLoanPerson] = useState('');
  const [loanType, setLoanType] = useState<BorrowedItem['type']>('emprestado_para');
  const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0]);

  // Mission delegation builder
  const [missionTitle, setMissionTitle] = useState('');
  const [missionHelper, setMissionHelper] = useState('');
  const [missionInstructions, setMissionInstructions] = useState('');
  const [missionSupplies, setMissionSupplies] = useState('');
  const [missionSuppliesLoc, setMissionSuppliesLoc] = useState('');
  const [missionTasksRaw, setMissionTasksRaw] = useState(''); // newline-separated checklist items

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultTitle.trim() || !vaultValue.trim()) return;
    addCriticalContact(vaultTitle.trim(), vaultValue.trim(), vaultCat);
    setVaultTitle('');
    setVaultValue('');
  };

  const handleCreateLost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lostName.trim() || !lostLoc.trim()) return;
    addLostObject(lostName.trim(), lostLoc.trim());
    setLostName('');
    setLostLoc('');
  };

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanName.trim() || !loanPerson.trim()) return;
    addBorrowedItem(loanName.trim(), loanPerson.trim(), loanType, loanDate);
    setLoanName('');
    setLoanPerson('');
    setLoanDate(new Date().toISOString().split('T')[0]);
  };

  const handleCreateMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionTitle.trim() || !missionHelper.trim()) return;

    // Split raw tasks from template
    const parsedTasks = missionTasksRaw
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .map((item, index) => ({
        id: `mt-${Date.now()}-${index}`,
        label: item,
        checked: false
      }));

    addMission({
      title: missionTitle.trim(),
      recipient: missionHelper.trim(),
      instructions: missionInstructions.trim(),
      suppliesNeeded: missionSupplies.trim(),
      locationOfSupplies: missionSuppliesLoc.trim(),
      tasks: parsedTasks.length > 0 ? parsedTasks : [
        { id: `mt-${Date.now()}-1`, label: 'Vistoria e asseio geral', checked: false }
      ]
    });

    setMissionTitle('');
    setMissionHelper('');
    setMissionInstructions('');
    setMissionSupplies('');
    setMissionSuppliesLoc('');
    setMissionTasksRaw('');
  };

  return (
    <div className="space-y-6 text-gray-800 dark:text-gray-100 animate-fade-in">
      
      {/* Upper header module details */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          <span className="p-1 px-2.5 bg-rose-500 text-white rounded-lg text-lg">7</span>
          Memória Crítica & Segurança
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Cofre de informações emergenciais estruturais, repositórios de pertences perdidos, contratos de empréstimo e portais de missões delegadas.
        </p>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('vault')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer rounded-t-xl ${
            activeTab === 'vault'
              ? 'bg-slate-50 border-t-2 border-[var(--theme-primary)] text-slate-900 dark:bg-slate-800 dark:text-white'
              : 'text-gray-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          🔑 Cofre de Informações (2s)
        </button>
        <button
          onClick={() => setActiveTab('lost')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer rounded-t-xl ${
            activeTab === 'lost'
              ? 'bg-slate-50 border-t-2 border-[var(--theme-primary)] text-slate-900 dark:bg-slate-800 dark:text-white'
              : 'text-gray-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          📍 Rastreador de Objetos
        </button>
        <button
          onClick={() => setActiveTab('loans')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer rounded-t-xl ${
            activeTab === 'loans'
              ? 'bg-slate-50 border-t-2 border-[var(--theme-primary)] text-slate-900 dark:bg-slate-800 dark:text-white'
              : 'text-gray-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          🤝 Histórico de Empréstimos
        </button>
        <button
          onClick={() => setActiveTab('missions')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer rounded-t-xl ${
            activeTab === 'missions'
              ? 'bg-slate-50 border-t-2 border-[var(--theme-primary)] text-slate-900 dark:bg-slate-800 dark:text-white'
              : 'text-gray-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          📝 Delegação de Contexto
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      <div className="pt-4">
        
        {/* TAB 1: COFRE DE INFORMAÇÕES DE EMERGÊNCIA */}
        {activeTab === 'vault' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Input form */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4 self-start">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-500" />
                Registrar Chave / Seguro / Código
              </h3>

              <form onSubmit={handleCreateContact} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase font-mono">Apelido/Identificação</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Seguradora da Casa"
                    value={vaultTitle}
                    onChange={e => setVaultTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase font-mono">Senha / Telefone / Dados Críticos</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Porto Seguro: 0800 / Cod Alarme"
                    value={vaultValue}
                    onChange={e => setVaultValue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase font-mono">Categoria</label>
                  <select
                    value={vaultCat}
                    onChange={e => setVaultCat(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-rose-500 select-none cursor-pointer"
                  >
                    <option value="emergência">Emergência 🚨</option>
                    <option value="localização">Disjuntor / Localização 🧭</option>
                    <option value="financeiro">Financeiro / Seguro 💰</option>
                    <option value="outros">Outros 📦</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-extrabold cursor-pointer"
                >
                  Adicionar ao Cofre
                </button>
              </form>
            </div>

            {/* Right: Quick elements rendering (Instant 2-second access) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 text-xs text-orange-900 dark:text-orange-400 rounded-xl border border-orange-200 dark:border-orange-900/60 flex items-start gap-2.5">
                <Info className="w-5 h-5 shrink-0" />
                <p className="font-semibold">Painel de Acesso Seguro Instantâneo: Use para localizar disjuntores gerais de luz, registros de água ou telefones de chaveiros em menos de 2 segundos de urgência.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {state.criticalContacts.map(cc => (
                  <div key={cc.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-705 flex justify-between items-start gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-extrabold font-mono uppercase px-1.5 py-0.5 rounded ${
                          cc.category === 'emergência' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' :
                          cc.category === 'localização' ? 'bg-indigo-100 text-indigo-750 dark:bg-indigo-950 dark:text-indigo-400' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {cc.category}
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-gray-950 dark:text-white capitalize">{cc.title}</h4>
                      <p className="text-xs text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850 font-mono select-all">
                        {cc.value}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm('Deletar este registro do cofre?')) deleteCriticalContact(cc.id);
                      }}
                      className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/20 text-rose-500 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: RASTREADOR DE OBJETOS PERDÍVEIS */}
        {activeTab === 'lost' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Input form */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4 self-start">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                Registrar Gaveta / Objeto
              </h3>

              <form onSubmit={handleCreateLost} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase font-mono">Nome do Objeto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Passaporte ou Certificado"
                    value={lostName}
                    onChange={e => setLostName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-450 uppercase font-mono">Onde está guardado? (Localização exata)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Segunda gaveta esquerda da escrivaninha"
                    value={lostLoc}
                    onChange={e => setLostLoc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-extrabold cursor-pointer"
                >
                  Registrar Localizador
                </button>
              </form>
            </div>

            {/* List browser */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {state.lostObjects.map(lo => (
                  <div key={lo.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-705 flex justify-between items-center bg-linear-to-r from-teal-500/5 to-transparent">
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white capitalize flex items-center gap-1.5">
                        <Key className="w-4 h-4 text-teal-500" />
                        {lo.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-slate-350">
                        Gaveta / Lugar: <strong className="text-slate-900 dark:text-slate-100">{lo.lastSeenLocation}</strong>
                      </p>
                      <span className="text-[10px] text-gray-400 font-mono block">
                        Atualizado em {new Date(lo.updatedAt).toLocaleDateString('pt-BR')} às {new Date(lo.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm('Deletar este item do rastreador?')) deleteLostObject(lo.id);
                      }}
                      className="p-1 hover:bg-rose-105 dark:hover:bg-rose-950/20 text-rose-500 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {state.lostObjects.length === 0 && (
                  <p className="text-xs text-gray-500 col-span-full py-8 text-center italic">Nenhum objeto de valor monitorado no momento.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: LOAN HISTORIC LEDGER */}
        {activeTab === 'loans' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Input form */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-705 space-y-4 self-start">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-500" />
                Registrar Empréstimo
              </h3>

              <form onSubmit={handleCreateLoan} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase font-mono">Produto Emprestado</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Furadeira pneumática Bosch"
                    value={loanName}
                    onChange={e => setLoanName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-205 rounded-xl text-xs font-semibold outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase font-mono">Nome da Pessoa</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Vizinho Marcos Apto 40"
                    value={loanPerson}
                    onChange={e => setLoanPerson(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-205 rounded-xl text-xs font-semibold outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase font-mono">Direção / Tipo</label>
                    <select
                      value={loanType}
                      onChange={e => setLoanType(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-205 rounded-xl text-xs font-semibold outline-none cursor-pointer"
                    >
                      <option value="emprestado_para">Emprestei para ele 👉</option>
                      <option value="pego_emprestado_de">Peguei dele de volta 👈</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase font-mono">Data de Registro</label>
                    <input
                      type="date"
                      required
                      value={loanDate}
                      onChange={e => setLoanDate(e.target.value)}
                      className="w-full px-3 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-205 rounded-xl text-xs font-semibold outline-none font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-extrabold cursor-pointer"
                >
                  Registrar Ledger
                </button>
              </form>
            </div>

            {/* Loans list tracker */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {state.borrowedItems.map(item => (
                  <div 
                    key={item.id} 
                    className={`p-4 rounded-xl border flex flex-col justify-between ${
                      item.returned 
                        ? 'bg-slate-50/50 border-slate-200 dark:bg-slate-900 dark:border-slate-850 opacity-60' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-705 shadow-xs'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded font-mono ${
                          item.type === 'emprestado_para' 
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400' 
                            : 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400'
                        }`}>
                          {item.type === 'emprestado_para' ? 'Cedi Empréstimo 📤' : 'Peguei Emprestado 📥'}
                        </span>

                        <button
                          onClick={() => {
                            if (confirm('Deletar transação do livro auxiliar?')) deleteBorrowedItem(item.id);
                          }}
                          className="text-gray-400 hover:text-rose-500 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-gray-905 dark:text-white">{item.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Envolvido: <strong className="text-slate-900 dark:text-slate-200">{item.personName}</strong>
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono mt-1">Registrado em {item.date.split('-').reverse().join('/')}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-850 pt-3 mt-3 flex justify-between items-center text-xs">
                      {item.returned ? (
                        <span className="text-emerald-600 font-bold font-mono">Devolvido em {item.returnedDate?.split('-').reverse().join('/')}!</span>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-amber-600 font-extrabold animate-pulse">Pendente Devolução ⏳</span>
                          <button
                            onClick={() => toggleBorrowedItemReturned(item.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] rounded cursor-pointer"
                          >
                            Marcar Devolução
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {state.borrowedItems.length === 0 && (
                  <p className="text-xs text-gray-500 col-span-full py-8 text-center italic">Nenhuma transação financeira ou de empréstimo catalogada.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: DELEGAÇÃO DE CONTEXTO / AUXILIO MISSÕES */}
        {activeTab === 'missions' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Context manual mission input builder */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-705 space-y-4 self-start">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-500" />
                Montar Missão / Tarefa de Ajuda
              </h3>
              <p className="text-xs text-gray-450">Formatado para delegar faxinas ou vistorias de prestadores com instruções completas.</p>

              <form onSubmit={handleCreateMission} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-450 uppercase">Nome da Missão *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Instruções de Faxina do Banheiro"
                    value={missionTitle}
                    onChange={e => setMissionTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-455 uppercase">Quem executará? *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Clara, Faxineira ou Marido"
                    value={missionHelper}
                    onChange={e => setMissionHelper(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-455 uppercase">Instruções Críticas</label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Não utilizar cloro no mármore escuro do tampo..."
                    value={missionInstructions}
                    onChange={e => setMissionInstructions(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-bold text-gray-455">Suprimentos que ele/ela precisa separados por vírgula</label>
                  <input
                    type="text"
                    placeholder="Ex: Detergente neutro, pano microfibra"
                    value={missionSupplies}
                    onChange={e => setMissionSupplies(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-201 rounded-xl text-xs"
                  />

                  {/* Smart recall pills from historical supplies and checklists */}
                  {Array.from(new Set(state.missions.flatMap(m => (m.suppliesNeeded || '').split(',')).map(s => s.trim()).filter(s => s.length > 0))).length > 0 && (
                    <div className="space-y-1 mt-1.5 pt-1">
                      <span className="text-[9.5px] font-black text-slate-400 block uppercase font-mono">Suprimentos já Utilizados Antes (Toque para Inserir):</span>
                      <div className="flex flex-wrap gap-1 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200/50 max-h-24 overflow-y-auto">
                        {Array.from(new Set(state.missions.flatMap(m => (m.suppliesNeeded || '').split(',')).map(s => s.trim()).filter(s => s.length > 0))).map(sup => (
                          <button
                            key={sup}
                            type="button"
                            onClick={() => {
                              setMissionSupplies(prev => {
                                const current = prev.split(',').map(x => x.trim()).filter(x => x.length > 0);
                                if (current.includes(sup)) return prev;
                                return [...current, sup].join(', ');
                              });
                            }}
                            className="text-[9.5px] font-black px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all cursor-pointer"
                          >
                            + {sup}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-455">Onde estão esses suprimentos?</label>
                  <input
                    type="text"
                    placeholder="Ex: Armário embaixo da pia principal"
                    value={missionSuppliesLoc}
                    onChange={e => setMissionSuppliesLoc(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-201 rounded-xl text-xs"
                  />
                </div>

                {/* Checklist items splits */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-455 block">Passo a Passo (Uma obrigação por linha) *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Ex: Tirar o lixo&#10;Lavar o box&#10;Limpar espelhos"
                    value={missionTasksRaw}
                    onChange={e => setMissionTasksRaw(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-201 rounded-xl text-xs font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-500 hover:bg-rose-650 text-white rounded-xl text-xs font-black cursor-pointer"
                >
                  Criar Cartão Delegação
                </button>
              </form>
            </div>

            {/* List active missions layout */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 gap-6">
                {state.missions.map(mission => {
                  const tasksTotal = mission.tasks.length;
                  const tasksDone = mission.tasks.filter(t => t.checked).length;
                  const progress = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

                  // Duplicate/Clone handler helper
                  const handleDuplicate = () => {
                    setMissionTitle(mission.title);
                    setMissionHelper(mission.recipient);
                    setMissionInstructions(mission.instructions || '');
                    setMissionSupplies(mission.suppliesNeeded || '');
                    setMissionSuppliesLoc(mission.locationOfSupplies || '');
                    setMissionTasksRaw(mission.tasks.map(t => t.label).join('\n'));
                    alert(`Os dados da missão "${mission.title}" foram carregados no formulário à esquerda. Ajuste os detalhes e salve!`);
                  };

                  return (
                    <div key={mission.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-705 space-y-4">
                      
                      <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-850 pb-2">
                        <div>
                          <h4 className="font-extrabold text-md text-gray-950 dark:text-white capitalize flex items-center gap-1.5">
                            <ClipboardList className="w-5 h-5 text-indigo-500" />
                            {mission.title}
                          </h4>
                          <p className="text-[11px] text-gray-500 mt-1">
                            Delegado para: <strong className="text-indigo-600 dark:text-indigo-400">{mission.recipient}</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Clone Duplicator trigger */}
                          <button
                            onClick={handleDuplicate}
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px] rounded-lg transition border border-indigo-100/30 cursor-pointer"
                            title="Duplicar esta estrutura para criar outra"
                          >
                            Duplicar Modelo
                          </button>

                          <button
                            onClick={() => {
                              if (confirm('Deletar este cartão de delegação de ajuda definitivamente?')) deleteMission(mission.id);
                            }}
                            className="p-1 hover:bg-rose-100 text-rose-500 rounded transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Instructions */}
                      {mission.instructions && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl text-xs space-y-1">
                          <span className="font-extrabold text-indigo-600 dark:text-indigo-400 block font-mono">Orientação Manual:</span>
                          <p className="italic text-gray-650 dark:text-slate-300">"{mission.instructions}"</p>
                        </div>
                      )}

                      {/* Supplies */}
                      {mission.suppliesNeeded && (
                        <div className="p-3 bg-stone-50 dark:bg-slate-890 rounded-xl text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 border border-slate-150 dark:border-slate-855">
                          <div>
                            <span className="font-bold text-gray-400 block uppercase tracking-wider font-mono text-[9px]">Materiais Próprios Necessários</span>
                            <span className="font-bold text-gray-800 dark:text-gray-200 capitalize">{mission.suppliesNeeded}</span>
                          </div>
                          {mission.locationOfSupplies && (
                            <div>
                              <span className="font-bold text-gray-400 block uppercase tracking-wider font-mono text-[9px]">Onde Localizá-los na Casa</span>
                              <span className="font-bold text-indigo-600 dark:text-indigo-400 capitalize">{mission.locationOfSupplies}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Check Tasks list */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider font-mono">Checklist Realizável de Tarefas:</span>
                        
                        <div className="space-y-1.5 select-none max-h-[14rem] overflow-y-auto pr-1">
                          {mission.tasks.map(mt => (
                            <div 
                              key={mt.id} 
                              onClick={() => toggleMissionTask(mission.id, mt.id)}
                              className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl flex items-center gap-3 cursor-pointer select-none hover:bg-slate-100/50"
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                                mt.checked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-350 bg-white dark:bg-slate-950'
                              }`}>
                                {mt.checked && <Check className="w-2.5 h-2.5 stroke-[4px]" />}
                              </div>
                              <span className={`text-xs ${mt.checked ? 'line-through text-slate-400' : 'text-slate-850 dark:text-slate-200 font-semibold'}`}>
                                {mt.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Progress meter */}
                      <div className="flex justify-between items-center text-xs font-semibold pt-1 border-t border-slate-100 dark:border-slate-850/60 mt-1">
                        <span>Progresso de Conclusão:</span>
                        <span className="font-mono text-indigo-600 font-bold">{progress}% ({tasksDone}/{tasksTotal})</span>
                      </div>

                    </div>
                  );
                })}
                {state.missions.length === 0 && (
                  <p className="text-xs text-gray-500 py-8 text-center italic">Nenhuma missão de delegação criada.</p>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
