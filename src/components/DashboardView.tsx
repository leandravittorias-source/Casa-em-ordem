/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppState, Task, PurchaseItem, PantryItem } from '../types';
import { 
  ClipboardList, ShoppingCart, Package, TrendingUp, AlertTriangle, 
  Calendar, CheckCircle2, ChevronRight, Award, Flame, Zap, ShieldAlert,
  Phone, Power, Droplet, X, Compass, Lock
} from 'lucide-react';

interface DashboardViewProps {
  state: AppState;
  onNavigate: (moduleIndex: number) => void;
}

export default function DashboardView({ state, onNavigate }: DashboardViewProps) {
  const [showEmergencyPanel, setShowEmergencyPanel] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Calculations for upper summary cards
  const pendingTasks = state.tasks.filter(t => !t.completed);
  const tasksToday = pendingTasks.filter(t => t.dueDate === todayStr).length;
  const overdueTasks = pendingTasks.filter(t => t.dueDate < todayStr).length;

  const currentMonthPurchases = state.purchases;
  const spentThisMonth = currentMonthPurchases
    .filter(p => p.purchased)
    .reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);

  const pantryBelowMin = state.pantry.filter(item => item.quantity <= item.minQuantity).length;

  const latestQuiz = state.quizHistory.length > 0 
    ? state.quizHistory[state.quizHistory.length - 1] 
    : null;
  const latestIndex = latestQuiz ? latestQuiz.score : 0;

  // 2. Weekly tasks stats (Completas vs Pendentes)
  // Let's group last 7 days including today
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const weekChartData = last7Days.map(dateStr => {
    // completed on this date
    const completedCount = state.tasks.filter(t => t.completed && t.completedAt?.startsWith(dateStr)).length;
    // pending with due date on this date
    const pendingCount = state.tasks.filter(t => !t.completed && t.dueDate === dateStr).length;
    
    // Day short label
    const dateObj = new Date(dateStr + 'T12:00:00');
    const dayLabel = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
    
    return { dateStr, dayLabel, completed: completedCount, pending: pendingCount };
  });

  const maxTicks = Math.max(...weekChartData.map(d => d.completed + d.pending), 3);

  // 3. Purchases by Category
  const categoriesMap: { [key: string]: number } = {};
  currentMonthPurchases.forEach(p => {
    if (p.purchased) {
      const g = p.quantity * p.unitPrice;
      categoriesMap[p.category] = (categoriesMap[p.category] || 0) + g;
    }
  });

  const categoryPurchasesData = Object.entries(categoriesMap).map(([cat, val]) => ({
    category: cat,
    total: val
  })).sort((a, b) => b.total - a.total);

  const totalSpentAllCategories = categoryPurchasesData.reduce((sum, item) => sum + item.total, 0);

  // 4. Quick List of Upcoming/Today Tasks (Limit 4)
  const upcomingTasks = [...state.tasks]
    .filter(t => !t.completed)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  // 5. Automatic monthly retrospection generator
  const getRetrospectiveData = () => {
    // Current or previous month
    const currentMonthLabel = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    const completedThisMonth = state.tasks.filter(t => {
      if (!t.completed || !t.completedAt) return false;
      const dateParts = t.completedAt.split('T')[0].split('-');
      const currentYearMonth = `${dateParts[0]}-${dateParts[1]}`;
      return currentYearMonth === state.currentPurchaseMonth;
    }).length;

    const outstandingThisMonth = state.tasks.filter(t => !t.completed).length;

    const habitsCount = state.habits.length;
    const completedHabitTicks = state.habits.reduce((sum, h) => sum + h.history.length, 0);

    return {
      monthLabel: currentMonthLabel.charAt(0).toUpperCase() + currentMonthLabel.slice(1),
      completedTasks: completedThisMonth,
      outstandingTasks: outstandingThisMonth,
      spent: spentThisMonth,
      habitCheckins: completedHabitTicks,
      pantryDeficiency: pantryBelowMin
    };
  };

  const retro = getRetrospectiveData();

  return (
    <div id="dashboard-view" className="space-y-8 animate-fade-in text-slate-800">
      
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-pink-500/10 via-indigo-500/5 to-transparent p-6 rounded-3xl border border-white/70 shadow-sm">
        <div>
          <h1 className="text-3xl font-sans font-black tracking-tight text-[#2D253D]">
            Olá, <span className="text-pink-600">{state.userProfile.name || 'Residente'}</span>!
          </h1>
          <p className="text-sm mt-1 text-[#4B5563] font-semibold">
            {state.crisisMode 
              ? '🚨 O "Modo Crise" está ativo. Foque apenas no essencial para manter a casa funcionando.'
              : 'O índice de ordem da sua casa está saudável. Continue cuidando do seu lar!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {state.crisisMode ? (
            <button
              onClick={() => onNavigate(6)} // Go to Order Index
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              Ver Modo Crise
            </button>
          ) : (
            <div className="px-4 py-2 bg-pink-100/80 text-pink-700 text-xs font-black uppercase tracking-wider rounded-xl border border-pink-200/50 flex items-center gap-1.5 shadow-2xs">
              <Zap className="w-4 h-4 text-pink-500 fill-pink-550 animate-pulse" />
              Sua Energia: {state.weeklyEnergy.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        
        {/* Card 1: Tarefas do Dia */}
        <div 
          onClick={() => onNavigate(1)} 
          className="bg-[#f0f9ff] text-[#0369a1] border-2 border-[#bae6fd]/70 p-5 rounded-[2.2rem] shadow-md shadow-sky-100 hover:shadow-sky-200/50 hover:scale-[1.02] active:scale-100 transition-all cursor-pointer relative overflow-hidden group min-h-[140px] flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-350/10 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between">
            <span className="text-2xl">📅</span>
            <span className="bg-[#bae6fd] text-[#0369a1] text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase font-mono tracking-wider">Hoje</span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-mono font-black tracking-tight text-[#0369a1]">{tasksToday}</p>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-85 mt-0.5 text-sky-800">Tarefas do Dia</p>
          </div>
        </div>
 
        {/* Card 2: Tarefas Atrasadas */}
        <div 
          onClick={() => onNavigate(1)} 
          className="bg-[#fdf2f8] text-[#be185d] border-2 border-[#fbcfe8]/70 p-5 rounded-[2.2rem] shadow-md shadow-pink-100 hover:shadow-pink-200/50 hover:scale-[1.02] active:scale-100 transition-all cursor-pointer relative overflow-hidden group min-h-[140px] flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-350/10 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between">
            <span className="text-2xl">⚠️</span>
            <span className="bg-[#fbcfe8] text-[#be185d] text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase font-mono tracking-wider">Crítico</span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-mono font-black tracking-tight text-[#be185d]">{overdueTasks}</p>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-85 mt-0.5 text-pink-800">Tarefas Atrasadas</p>
          </div>
        </div>
 
        {/* Card 3: Lista de Compras */}
        <div 
          onClick={() => onNavigate(2)} 
          className="bg-[#fefbeb] text-[#b45309] border-2 border-[#fef08a]/70 p-5 rounded-[2.2rem] shadow-md shadow-amber-100 hover:shadow-amber-200/50 hover:scale-[1.02] active:scale-100 transition-all cursor-pointer relative overflow-hidden group min-h-[140px] flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-350/10 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between">
            <span className="text-2xl">🛒</span>
            <span className="bg-[#fef08a] text-[#b45309] text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase font-mono tracking-wider">Mês</span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-mono font-black tracking-tight text-[#b45309]">R$ {spentThisMonth.toFixed(0)}</p>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-85 mt-0.5 text-amber-800">Total Gasto</p>
          </div>
        </div>
 
        {/* Card 4: Despensa Crítica */}
        <div 
          onClick={() => onNavigate(3)} 
          className="bg-[#ecfdf5] text-[#047857] border-2 border-[#a7f3d0]/70 p-5 rounded-[2.2rem] shadow-md shadow-emerald-100 hover:shadow-emerald-200/50 hover:scale-[1.02] active:scale-100 transition-all cursor-pointer relative overflow-hidden group min-h-[140px] flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-350/10 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between">
            <span className="text-2xl">📦</span>
            <span className="bg-[#a7f3d0] text-[#047857] text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase font-mono tracking-wider">Baixo</span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-mono font-black tracking-tight text-[#047857]">{pantryBelowMin}</p>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-85 mt-0.5 text-emerald-850">Itens Despensa</p>
          </div>
        </div>
 
        {/* Card 5: Índice de Ordem */}
        <div 
          onClick={() => onNavigate(6)} 
          className="bg-[#faf5ff] text-[#6d28d9] border-2 border-[#e9d5ff]/75 p-5 rounded-[2.2rem] shadow-md shadow-purple-100 hover:shadow-purple-200/50 hover:scale-[1.02] active:scale-100 transition-all cursor-pointer col-span-2 lg:col-span-1 relative overflow-hidden group min-h-[140px] flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-355/10 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between">
            <span className="text-2xl">📈</span>
            <span className="bg-[#e9d5ff] text-[#6d28d9] text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase font-mono tracking-wider">Pontos</span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-mono font-black tracking-tight text-[#6d28d9]">{latestIndex}%</p>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-85 mt-0.5 text-purple-800">Índice Ordem</p>
          </div>
        </div>
 
      </div>
 
      {/* Visual Charts Section (Task completions + Shopping Categorized Spends) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Stats Dynamic SVG Bar Chart */}
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm">
          <h3 className="font-sans font-black text-lg text-[#2D253D] flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-pink-500" />
            Tarefas da Semana (Concluídas vs Agendadas)
          </h3>
          
          <div className="relative h-64 w-full flex items-end justify-between px-2 pt-8">
            {/* Visual Guide Lines */}
            <div className="absolute inset-x-0 bottom-8 border-b border-dashed border-slate-100 text-[10px] text-slate-400 font-mono flex justify-between pr-2" />
            <div className="absolute inset-x-0 bottom-24 border-b border-dashed border-slate-100 text-[10px] text-slate-400 font-mono flex justify-between pr-2" />
            <div className="absolute inset-x-0 bottom-40 border-b border-dashed border-slate-100 text-[10px] text-slate-400 font-mono" />
            
            {weekChartData.map((day, dIdx) => {
              const maxVal = Math.max(maxTicks, 4);
              const compPercent = (day.completed / maxVal) * 100;
              const pendPercent = (day.pending / maxVal) * 100;
 
              return (
                <div key={day.dateStr} className="flex flex-col items-center flex-1 group z-10">
                  <div className="w-full flex items-end justify-center gap-1.5 h-44 mb-2">
                    {/* Completed Bar (Pink) */}
                    <div className="relative w-4 rounded-t-lg bg-pink-400 hover:bg-pink-500 hover:brightness-105 transition-all flex justify-center"
                         style={{ height: `${Math.max(4, compPercent)}%` }}>
                      <span className="absolute -top-6 text-[10px] font-mono font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none whitespace-nowrap">
                        {day.completed} Feita(s)
                      </span>
                    </div>
 
                    {/* Pending Bar (Sky pastel blue) */}
                    <div className="relative w-4 rounded-t-lg bg-sky-205 bg-[#bae6fd] hover:brightness-105 transition-all flex justify-center"
                         style={{ height: `${Math.max(4, pendPercent)}%` }}>
                      <span className="absolute -top-6 text-[10px] font-mono font-bold bg-slate-800 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none whitespace-nowrap">
                        {day.pending} Pendente(s)
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#4B5563] capitalize">{day.dayLabel}</span>
                </div>
              );
            })}
          </div>
 
          <div className="flex justify-center items-center gap-6 mt-4 text-xs font-bold text-[#4B5563]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-pink-400 shadow-sm" />
              <span>Concluídas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#bae6fd] shadow-sm" />
              <span>Agendadas</span>
            </div>
          </div>
        </div>
 
        {/* Expenses by Category Breakdown Card */}
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-sans font-black text-lg text-[#2D253D] flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5 text-indigo-500" />
              Gastos por Categoria de Compras
            </h3>
 
            {categoryPurchasesData.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4">
                <p className="text-sm text-slate-500 font-semibold">Nenhum item comprado marcado na lista do mês até agora.</p>
                <button 
                  onClick={() => onNavigate(2)}
                  className="mt-3 text-xs text-pink-600 hover:underline font-black uppercase tracking-wider cursor-pointer"
                >
                  Abrir Lista de Compras →
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[12rem] overflow-y-auto pr-1">
                {categoryPurchasesData.map(item => {
                  const percent = totalSpentAllCategories > 0 ? (item.total / totalSpentAllCategories) * 100 : 0;
                  return (
                    <div key={item.category} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="capitalize text-slate-700">{item.category}</span>
                        <span className="font-mono text-[#2D253D]">
                          R$ {item.total.toFixed(2)} ({percent.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
 
          <div className="bg-white/50 backdrop-blur-3xs p-3 rounded-2xl border border-white/80 mt-4 flex justify-between items-center text-sm font-semibold">
            <span className="text-[#4B5563]">Gasto Total Comprado:</span>
            <span className="text-lg font-mono text-pink-600 font-black">R$ {totalSpentAllCategories.toFixed(2)}</span>
          </div>
        </div>
 
      </div>
 
      {/* Grid: Upcoming Quick tasks & Month Retrospective */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming priorities */}
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-sans font-black text-lg text-[#2D253D] flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-pink-500" />
              Tarefas Urgentes a Caminho
            </h3>
            <button 
              onClick={() => onNavigate(1)}
              className="text-xs text-pink-600 hover:underline font-black uppercase tracking-wider flex items-center cursor-pointer"
            >
              Ver Todas <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
 
          {upcomingTasks.length === 0 ? (
            <div className="py-8 text-center text-[#4B5563] font-semibold text-sm">
              ✨ Sem tarefas pendentes! Tudo em ordem por aqui.
            </div>
          ) : (
            <div className="divide-y divide-slate-100/60">
              {upcomingTasks.map(task => {
                const isOverdue = task.dueDate < todayStr;
                return (
                  <div key={task.id} className="py-3.5 flex items-start justify-between gap-3 group">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-[#1F2937] group-hover:text-pink-600 transition-colors">
                        {task.title}
                      </h4>
                      <p className="text-xs text-[#4B5563] line-clamp-1">
                        {task.description || 'Sem descrição.'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${
                          task.priority === 'alta' ? 'bg-red-50 text-red-600 border border-red-200' :
                          task.priority === 'média' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-slate-55 bg-slate-50 text-slate-500'
                        }`}>
                          {task.priority}
                        </span>
                        <span className={`text-[10px] font-mono font-bold ${isOverdue ? 'text-rose-600 font-black' : 'text-slate-400'}`}>
                          Prazo: {task.dueDate.split('-').reverse().join('/')} {isOverdue ? '(Atrasada! ⚠️)' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
 
        {/* Retrospectiva Automática Mensal */}
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full translate-x-12 -translate-y-12" />
          
          <div>
            <h3 className="font-sans font-black text-lg text-[#2D253D] flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-pink-500" />
              Retrospectiva de {retro.monthLabel}
            </h3>
            <p className="text-xs text-[#4B5563] mb-4 font-semibold">
              Estatísticas automáticas computadas dinamicamente baseadas nas ações realizadas este mês.
            </p>
 
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/60 backdrop-blur-3xs p-3.5 rounded-2xl border border-white/80 shadow-2xs">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">Concluídas</span>
                <p className="text-lg font-mono font-black text-emerald-600 mt-1">{retro.completedTasks} tarefas</p>
              </div>
              <div className="bg-white/60 backdrop-blur-3xs p-3.5 rounded-2xl border border-white/80 shadow-2xs">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">Pendentes</span>
                <p className="text-lg font-mono font-black text-slate-500 mt-1">{retro.outstandingTasks} tarefas</p>
              </div>
              <div className="bg-white/60 backdrop-blur-3xs p-3.5 rounded-2xl border border-white/80 shadow-2xs">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">Total Compras</span>
                <p className="text-lg font-mono font-black text-indigo-600 mt-1">R$ {retro.spent.toFixed(2)}</p>
              </div>
              <div className="bg-white/60 backdrop-blur-3xs p-3.5 rounded-2xl border border-white/80 shadow-2xs">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">Hábitos</span>
                <p className="text-lg font-mono font-black text-pink-650 mt-1 text-pink-650 flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500 inline-block" />
                  {retro.habitCheckins} check-ins
                </p>
              </div>
            </div>
          </div>
 
          <div className="mt-6 text-xs text-[#4B5563] bg-pink-500/5 p-3 rounded-xl border border-pink-500/10 text-center italic font-semibold">
            {retro.completedTasks > 0 || retro.habitCheckins > 0 
              ? '✨ Ótimo trabalho! Manter a persistência diária assegura a saúde e o bem-estar do seu ambiente residencial.'
              : 'Comece a marcar suas tarefas concluídas e check-ins de hábitos para colher insights detalhados na retrospectiva.'}
          </div>
        </div>
 
      </div>
 
    </div>
  );
}
