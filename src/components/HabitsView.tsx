/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Habit, NightlyChecklistItem, WeeklyEnergy, SeasonalTask } from '../types';
import { 
  Plus, Trash2, Edit2, CheckCircle, Clock, Zap, Sun, Moon, 
  Dribbble, Flame, Calendar, RefreshCw, X, Check, Save, Sparkles, Heart
} from 'lucide-react';

interface HabitsViewProps {
  habits: Habit[];
  nightlyRoutine: NightlyChecklistItem[];
  weeklyEnergy: WeeklyEnergy;
  energySetDate?: string; // Weekly check Sunday logic
  seasonalTasks: SeasonalTask[];
  addHabit: (name: string, frequency: 'diário' | 'semanal') => void;
  updateHabit: (id: string, name: string, frequency: 'diário' | 'semanal') => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string, dateStr: string) => void;
  addNightlyItem: (label: string) => void;
  editNightlyItem: (id: string, label: string) => void;
  deleteNightlyItem: (id: string) => void;
  toggleNightlyItem: (id: string) => void;
  resetNightlyRoutine: () => void;
  setWeeklyEnergy: (energy: WeeklyEnergy) => void;
  toggleSeasonalTask: (id: string, year: number) => void;
  addSeasonalTask: (title: string, month: number, description: string) => void;
  editSeasonalTask: (id: string, title: string, month: number, description: string) => void;
  deleteSeasonalTask: (id: string) => void;
}

export default function HabitsView({
  habits, nightlyRoutine, weeklyEnergy, energySetDate, seasonalTasks,
  addHabit, updateHabit, deleteHabit, toggleHabit,
  addNightlyItem, editNightlyItem, deleteNightlyItem, toggleNightlyItem, resetNightlyRoutine,
  setWeeklyEnergy, toggleSeasonalTask, addSeasonalTask, editSeasonalTask, deleteSeasonalTask
}: HabitsViewProps) {
  
  const todayStr = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();
  const currentMonthNum = new Date().getMonth(); // 0-11

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '24px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.03)',
  };

  // Modals / forms state
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitFreq, setNewHabitFreq] = useState<'diário' | 'semanal'>('diário');

  const [newNightlyItemLabel, setNewNightlyItemLabel] = useState('');
  const [editingNightlyId, setEditingNightlyId] = useState<string | null>(null);
  const [editNightlyLabel, setEditNightlyLabel] = useState('');

  // Editing state for Nightly checklist list items (Instructed on demand!)
  const [isEditingNightlyList, setIsEditingNightlyList] = useState(false);

  // Sunday Energy modal state
  const [showEnergyModal, setShowEnergyModal] = useState(false);

  const [showAddSeasonal, setShowAddSeasonal] = useState(false);
  const [seasonalTitle, setSeasonalTitle] = useState('');
  const [seasonalMonth, setSeasonalMonth] = useState(currentMonthNum);
  const [seasonalDesc, setSeasonalDesc] = useState('');

  // Weekly check Sunday checker popup
  useEffect(() => {
    if (!energySetDate) {
      setShowEnergyModal(true);
      return;
    }

    const getStartOfWeekStr = (dateObj: Date) => {
      const d = new Date(dateObj);
      const day = d.getDay();
      const diff = d.getDate() - day; // Adjust back to Sunday
      d.setDate(diff);
      return d.toISOString().split('T')[0];
    };

    const startOfCurrentWeek = getStartOfWeekStr(new Date());
    const startOfSavedWeek = getStartOfWeekStr(new Date(energySetDate + 'T12:00:00'));

    // If different weeks, display the prompt overlay
    if (startOfCurrentWeek !== startOfSavedWeek) {
      setShowEnergyModal(true);
    }
  }, [energySetDate]);

  // Past 14 days list to build consistency check calendar
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split('T')[0];
  });

  const monthsPortuguese = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    addHabit(newHabitName.trim(), newHabitFreq);
    setNewHabitName('');
  };

  const handleCreateNightly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNightlyItemLabel.trim()) return;
    addNightlyItem(newNightlyItemLabel.trim());
    setNewNightlyItemLabel('');
  };

  const startEditNightlyItem = (item: NightlyChecklistItem) => {
    setEditingNightlyId(item.id);
    setEditNightlyLabel(item.label);
  };

  const handleSaveNightlyEdit = (id: string) => {
    if (!editNightlyLabel.trim()) return;
    editNightlyItem(id, editNightlyLabel.trim());
    setEditingNightlyId(null);
  };

  const handleCreateSeasonal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seasonalTitle.trim()) return;
    addSeasonalTask(seasonalTitle.trim(), seasonalMonth, seasonalDesc.trim());
    setSeasonalTitle('');
    setSeasonalDesc('');
    setShowAddSeasonal(false);
  };

  // Calculates percentage of nightly routine completed
  const nightlyTotal = nightlyRoutine.length;
  const nightlyChecked = nightlyRoutine.filter(n => n.checked).length;
  const nightlyPercent = nightlyTotal > 0 ? Math.round((nightlyChecked / nightlyTotal) * 100) : 0;

  // Filter seasonal tasks that match the current month to alert
  const currentMonthSeasonal = seasonalTasks.filter(st => st.month === currentMonthNum);

  return (
    <div id="habits-view" className="space-y-8 text-slate-850 animate-fade-in text-slate-800">
      
      {/* Sunday/Monday Weekly Energy Modal Overlay */}
      {showEnergyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-lg border border-white/80 p-8 rounded-[2.2rem] max-w-md w-full shadow-2xl relative animate-scale-in text-slate-800">
            <div className="absolute top-4 right-4">
              <button
                type="button"
                onClick={() => setShowEnergyModal(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center mx-auto border border-yellow-100/50 shadow-2xs">
                <Zap className="w-8 h-8 fill-yellow-500 text-yellow-500 animate-bounce" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold font-sans text-[#2D253D] tracking-tight">Definir Energia da Semana</h3>
                <p className="text-xs text-[#4B5563] font-semibold leading-relaxed">
                  Como está sua carga físico-mental para esta nova semana? Definir seu ritmo adapta e simplifica as tarefas secundárias pesadas automaticamente.
                </p>
              </div>

              <div className="space-y-2.5 pt-3">
                {(['baixa', 'média', 'alta'] as WeeklyEnergy[]).map(energy => (
                  <button
                    key={energy}
                    onClick={() => {
                      setWeeklyEnergy(energy);
                      setShowEnergyModal(false);
                    }}
                    className={`w-full py-3 px-4 rounded-xl text-left font-bold text-sm transition-all border flex items-center justify-between cursor-pointer ${
                      weeklyEnergy === energy
                        ? 'bg-amber-50 border-amber-500 text-amber-800 font-extrabold shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="capitalize font-black text-sm">{energy === 'baixa' ? '🧘 Baixa' : energy === 'média' ? '⚡ Média' : '🔥 Alta'}</span>
                      <span className="text-[10px] text-gray-500 font-medium font-sans mt-0.5 leading-tight">
                        {energy === 'baixa' ? '(Apenas o crítico de sobrevivência doméstica)' 
                         : energy === 'média' ? '(Ritmo normal e moderado do dia-a-dia)' 
                         : '(Mutirão da ordem de ponta a ponta na moradia)'}
                      </span>
                    </div>
                    {weeklyEnergy === energy && <Check className="w-5 h-5 text-amber-600 font-black" />}
                  </button>
                ))}
              </div>

              <p className="text-[9px] text-slate-400 font-mono italic leading-relaxed pt-2">
                Essa energia global recalcula tarefas e ajuda a organizar sua agenda.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. MAIN MODULE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-linear-to-r from-pink-500/10 via-indigo-500/5 to-transparent p-6 rounded-3xl border border-white/70 shadow-sm">
        <div>
          <h2 className="text-2xl font-sans font-black tracking-tight text-[#2D253D] flex items-center gap-2">
            <span className="p-1 px-2.5 bg-pink-500 text-white rounded-2xl text-base shadow-2xs"> M5 </span>
            Hábitos Consistentes & Fechamento Noturno
          </h2>
          <p className="text-sm text-[#4B5563] font-semibold">
            Garanta a consistência de rituais diários e feche as portas de acidentes domésticos estruturando vistorias.
          </p>
        </div>
      </div>

      {/* DISCRETE WEEKLY ENERGY HIGHLIGHTED HEADER COMPONENT */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-linear-to-r from-yellow-500/10 via-amber-500/5 to-transparent p-5 rounded-2xl border border-yellow-250/20 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-100 text-yellow-600 rounded-xl shadow-2xs">
            <Zap className="w-5 h-5 fill-yellow-500 text-yellow-500 animate-pulse" />
          </div>
          <div>
            <h4 className="font-sans font-black text-sm text-[#2D253D]">Sua Energia Produtiva Pessoal</h4>
            <p className="text-xs text-[#4B5563] font-semibold mt-0.5">
              Definida para esta semana como: <span className="uppercase text-amber-700 bg-amber-100/70 py-0.5 px-2 rounded-lg border border-amber-200/30 text-xs font-black">{weeklyEnergy}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowEnergyModal(true)}
          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-205 text-xs text-slate-800 font-extrabold rounded-xl transition cursor-pointer shadow-3xs flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
          Alterar Fadiga / Energia
        </button>
      </div>

      {/* Grid structure: Night routine (takes 3 cols) */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Module 5.2: Rotina de Fechamento Noturna (Restyled beautiful light glass profile container) */}
        <div style={glassStyle} className="p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full translate-x-12 -translate-y-12" />
          
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-4 border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-550 rounded-lg shadow-3xs">
                  <Moon className="w-5 h-5 fill-indigo-400 text-indigo-550" />
                </div>
                <div>
                  <h3 className="font-sans font-black text-sm text-[#2D253D]">Rotina de Fechamento Noturna 🌜</h3>
                  <p className="text-[11px] text-[#4B5563] font-semibold mt-0.5">Procedimentos práticos de encerramento diário para executar antes de descansar.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Discrete List management toggle button */}
                <button
                  type="button"
                  onClick={() => setIsEditingNightlyList(!isEditingNightlyList)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1 transition-all border cursor-pointer ${
                    isEditingNightlyList 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500' 
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {isEditingNightlyList ? <Check className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                  <span>{isEditingNightlyList ? 'Concluir Edição' : 'Editar Lista'}</span>
                </button>

                {nightlyChecked > 0 && (
                  <button
                    onClick={resetNightlyRoutine}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-xs text-indigo-600 font-extrabold rounded-xl cursor-pointer transition"
                  >
                    Resetar Checks
                  </button>
                )}
              </div>
            </div>

            {/* Nightly list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[16rem] overflow-y-auto pr-1 pb-1">
              {nightlyRoutine.map(item => {
                const isEditing = editingNightlyId === item.id;
                return (
                  <div key={item.id} className="flex items-center justify-between gap-4 bg-white/75 p-4 rounded-2xl border border-slate-200 text-slate-800 shadow-2xs hover:border-indigo-200 transition-all">
                    {isEditing ? (
                      <div className="flex gap-1.5 w-full">
                        <input
                          type="text"
                          value={editNightlyLabel}
                          onChange={e => setEditNightlyLabel(e.target.value)}
                          className="flex-1 px-3 py-1 bg-white border border-slate-205 text-xs text-slate-800 font-semibold rounded-lg outline-none focus:border-indigo-400"
                        />
                        <button onClick={() => handleSaveNightlyEdit(item.id)} className="p-1 px-2.5 text-[10px] bg-[#2D253D] rounded-lg text-white font-black cursor-pointer">OK</button>
                        <button onClick={() => setEditingNightlyId(null)} className="p-1 px-2.5 text-[10px] bg-slate-200 rounded-lg cursor-pointer">X</button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-4.5 w-full py-1">
                          <button
                            onClick={() => toggleNightlyItem(item.id)}
                            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all border cursor-pointer shrink-0 ${
                              item.checked 
                                ? 'bg-[#2D253D] border-[#2D253D] text-white shadow-2xs' 
                                : 'border-slate-300 bg-white hover:scale-105 hover:border-[#2D253D]'
                            }`}
                          >
                            {item.checked && <Check className="w-4 h-4 stroke-[4.5px]" />}
                          </button>
                          <span className={`text-[13px] tracking-tight text-left leading-snug cursor-pointer select-none font-bold ${
                            item.checked 
                              ? 'line-through text-slate-400 font-semibold' 
                              : 'text-slate-900 font-black'
                          }`}
                          onClick={() => toggleNightlyItem(item.id)}
                          >
                            {item.label}
                          </span>
                        </div>

                        {/* Manage buttons shown ONLY when in editing mode */}
                        {isEditingNightlyList && (
                          <div className="flex items-center gap-1.5 transition-all">
                            <button onClick={() => startEditNightlyItem(item)} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer" title="Renomear">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteNightlyItem(item.id)} className="p-1.5 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 rounded-lg transition cursor-pointer animate-pulse" title="Remover">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add nightly routine item form: Hidden by default and revealed ONLY in edit list mode */}
            {isEditingNightlyList && (
              <form onSubmit={handleCreateNightly} className="flex gap-2 bg-indigo-50/20 p-3 rounded-2xl border border-indigo-100 border-dashed animate-fade-in mt-2">
                <input
                  type="text"
                  required
                  placeholder="Ex: Trancar registro do gás / Alimentar cão de guarda..."
                  value={newNightlyItemLabel}
                  onChange={e => setNewNightlyItemLabel(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 text-xs rounded-xl text-slate-850 font-semibold outline-none focus:border-indigo-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2D253D] hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Incluir Ação
                </button>
              </form>
            )}
          </div>

          <div className="flex justify-between items-center text-[11px] text-[#4B5563] font-semibold border-t border-slate-105 pt-3 mt-4">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-100/50" />
              Sincronização Ativa: 100% da rotina preenche automaticamente a constância do dia no histórico!
            </span>
            <span className="font-mono text-indigo-700 font-mono font-black">{nightlyChecked} de {nightlyTotal} resolvidas ({nightlyPercent}%)</span>
          </div>
        </div>

      </div>

      {/* Module 5.3: Hábitos Diários & Streak Tracker Consistency Grid */}
      <div style={glassStyle} className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shadow-3xs">
              <Flame className="w-5 h-5 fill-emerald-500 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-sans font-black text-sm text-[#2D253D]">Consistência de Hábitos Diários</h3>
              <p className="text-xs text-[#4B5563] font-semibold">Acompanhe sequências consecutivas (streak) e cheque o seu progresso.</p>
            </div>
          </div>

          {/* Form to insert habit */}
          <form onSubmit={handleCreateHabit} className="flex gap-2 self-start sm:self-center">
            <input
              type="text"
              required
              placeholder="Ex: Beber 3L de Água"
              value={newHabitName}
              onChange={e => setNewHabitName(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-205 text-xs rounded-xl outline-none text-slate-800 font-semibold focus:border-emerald-450"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all"
            >
              Adicionar Hábito
            </button>
          </form>
        </div>

        {/* Habits list showing past 14 days grid matrix */}
        <div className="space-y-6">
          {habits.map(habit => {
            return (
              <div key={habit.id} className="p-4 bg-white/60 rounded-2xl border border-slate-201 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-black text-sm text-[#2D253D] capitalize">{habit.name}</span>
                    <span className="text-[10px] bg-[#2D253D]/10 font-mono text-[#2D253D] px-2 py-0.5 rounded-lg capitalize font-black tracking-wider">
                      {habit.frequency}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 bg-orange-50 px-2.5 py-1 text-orange-600 rounded-lg font-mono font-black border border-orange-100">
                      <Flame className="w-3.5 h-3.5 fill-orange-550 text-orange-500 animate-pulse" />
                      <span>{habit.streak} Dias Seguidos</span>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm('Deletar este hábito do painel?')) deleteHabit(habit.id);
                      }}
                      className="p-1.5 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-500 rounded-lg transition cursor-pointer"
                      title="Apagar Hábito"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Last 14 days calendar checkers scrollable box */}
                <div className="space-y-1">
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider block font-mono">Histórico de Conclusão (Últimos 14 Dias):</span>
                  
                  <div className="flex items-center justify-start gap-1.5 overflow-x-auto pb-2 pt-1">
                    {last14Days.map(dateStr => {
                      const completed = habit.history.includes(dateStr);
                      const isToday = dateStr === todayStr;
                      const dObj = new Date(dateStr + 'T12:00:00');
                      const weekday = dObj.toLocaleDateString('pt-BR', { weekday: 'short' }).charAt(0).toUpperCase();

                      return (
                        <div 
                          key={dateStr}
                          onClick={() => toggleHabit(habit.id, dateStr)}
                          className={`flex flex-col items-center p-1.5 px-3 rounded-xl border text-center cursor-pointer select-none transition-all ${
                            completed
                              ? 'bg-emerald-500 border-emerald-500 text-white font-black shadow-3xs'
                              : isToday
                                ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-black'
                                : 'bg-white border-slate-205 hover:border-[#2D253D] text-slate-700'
                          }`}
                          title={`Marcar completado em ${dateStr.split('-').reverse().join('/')}`}
                        >
                          <span className="text-[10px] font-extrabold uppercase mb-1">{weekday}</span>
                          <span className="text-[10px] font-mono leading-none">{dObj.getDate()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })}
          {habits.length === 0 && (
            <p className="text-center py-6 text-xs text-slate-400 font-semibold font-mono">Nenhum hábito cadastrado no painel de acompanhamento.</p>
          )}
        </div>
      </div>

      {/* Module 5.4: Sazonalidade (Annual Tasks Calendar Grid) */}
      <div style={glassStyle} className="p-6 space-y-6">
        
        <div className="flex justify-between items-center border-b border-rose-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg shadow-3xs">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-sans font-black text-sm text-[#2D253D]">Sazonalidade Doméstica Anual 📅</h3>
              <p className="text-xs text-[#4B5563] font-semibold">Eventos de menor frequência que ocorrem uma única vez por ano.</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddSeasonal(!showAddSeasonal)}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-650 text-white text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer shadow-3xs"
          >
            {showAddSeasonal ? 'Fechar Painel' : 'Agendar Sazonal'}
          </button>
        </div>

        {/* Current active months visual alert */}
        {currentMonthSeasonal.length > 0 && (
          <div className="p-4 bg-amber-50/50 border border-amber-250/30 rounded-2xl text-xs text-yellow-950 space-y-1">
            <p className="font-bold flex items-center gap-1 pb-1">
              <Sparkles className="w-4 h-4 fill-yellow-500 text-yellow-505" />
              Noticiador: Compromissos Sazonais em Aberto para Este Mês ({monthsPortuguese[currentMonthNum]})!
            </p>
            <div className="space-y-1">
              {currentMonthSeasonal.map(st => (
                <div key={st.id} className="pl-4 font-mono font-semibold text-slate-850">
                  • <strong>{st.title}</strong>: {st.description || 'Sem notas adicionais.'}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add seasonal task form */}
        {showAddSeasonal && (
          <form onSubmit={handleCreateSeasonal} className="bg-white/60 p-5 rounded-2xl border border-slate-201 space-y-3 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[#4B5563]">Título do Compromisso Sazonal</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Lavagem técnica de carpetes / Revisão do aquecedor"
                  value={seasonalTitle}
                  onChange={e => setSeasonalTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white text-slate-800 font-semibold text-xs border border-slate-202 rounded-xl outline-none focus:border-yellow-405"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[#4B5563]">Mês de Execução</label>
                <select
                  value={seasonalMonth}
                  onChange={e => setSeasonalMonth(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-white text-slate-850 font-semibold text-xs border border-slate-202 rounded-xl cursor-pointer outline-none focus:border-yellow-405"
                >
                  {monthsPortuguese.map((m, idx) => (
                    <option key={m} value={idx}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-[#4B5563]">Descrição/Instruções Adicionais</label>
              <input
                type="text"
                placeholder="Explicar onde ficam os produtos de limpeza ou qual assistencia técnica contatar..."
                value={seasonalDesc}
                onChange={e => setSeasonalDesc(e.target.value)}
                className="w-full px-3 py-1.5 bg-white text-slate-805 font-semibold text-xs border border-slate-202 rounded-xl outline-none focus:border-yellow-450"
              />
            </div>

            <div className="flex justify-end gap-1.5 pt-1">
              <button type="submit" className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer">OK Agendar</button>
            </div>
          </form>
        )}

        {/* Sequential list of 12 months grids obligations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {monthsPortuguese.map((mName, mIdx) => {
            const matchingTasks = seasonalTasks.filter(st => st.month === mIdx);
            const isCurrentActiveMonth = mIdx === currentMonthNum;

            return (
              <div 
                key={mName}
                className={`p-4 rounded-2xl border flex flex-col justify-between ${
                  isCurrentActiveMonth 
                    ? 'bg-yellow-50/70 border-yellow-300' 
                    : 'bg-white/80 border-slate-201 text-slate-800'
                }`}
              >
                <div>
                  <h4 className="font-extrabold text-xs text-[#2D253D] uppercase tracking-wider mb-2 font-mono flex items-center justify-between">
                    <span>{mName}</span>
                    {isCurrentActiveMonth && <span className="text-[9px] bg-yellow-500 text-white font-extrabold px-1.5 py-0.5 rounded">Vigente</span>}
                  </h4>

                  <div className="space-y-2 max-h-[10rem] overflow-y-auto pr-1">
                    {matchingTasks.map(task => {
                      const completeThisYear = task.completedYears.includes(currentYear);
                      return (
                        <div key={task.id} className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] space-y-1 relative font-semibold text-slate-800 shadow-3xs">
                          <p className="font-black text-[#2D253D] line-clamp-1">{task.title}</p>
                          <p className="text-[10px] text-[#4B5563] line-clamp-3 leading-relaxed">{task.description}</p>
                          
                          <div className="flex items-center justify-between pt-1.5 border-t border-slate-105 mt-1.5">
                            <button
                              onClick={() => toggleSeasonalTask(task.id, currentYear)}
                              className={`px-2 py-0.5 text-[9px] font-black rounded-lg border cursor-pointer ${
                                completeThisYear 
                                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                                  : 'bg-white border-slate-201 text-slate-500 hover:border-[#2D253D]'
                              }`}
                            >
                              {completeThisYear ? `Feito!` : 'Concluir'}
                            </button>

                            <button onClick={() => deleteSeasonalTask(task.id)} className="text-slate-400 hover:text-rose-500 cursor-pointer animate-pulse transition-transform active:scale-90 p-1">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {matchingTasks.length === 0 && (
                      <p className="text-[10px] text-slate-400 italic py-2 text-center font-semibold text-zinc-400">Nenhum evento agendado.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
