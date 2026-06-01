/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Task, Priority, TaskCategory } from '../types';
import { 
  Plus, Trash2, Edit2, Check, Filter, ArrowUpDown, Shuffle, 
  Trash, Save, X, Calendar, RefreshCw, AlertCircle, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TodoViewProps {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  updateTask: (id: string, updatedFields: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

export default function TodoView({ tasks, addTask, updateTask, toggleTask, deleteTask }: TodoViewProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  // Forms state
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('média');
  const [category, setCategory] = useState<TaskCategory>('casa');
  const [dueDate, setDueDate] = useState(todayStr);
  const [recurrence, setRecurrence] = useState<Task['recurrence']>('none');

  // Editing state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('média');
  const [editCategory, setEditCategory] = useState<TaskCategory>('casa');
  const [editDueDate, setEditDueDate] = useState('');
  const [editRecurrence, setEditRecurrence] = useState<Task['recurrence']>('none');

  // Filter state
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('pending');
  const [sortBy, setSortBy] = useState<'due_date' | 'priority_high' | 'created'>('due_date');

  // Surprise drawer
  const [surpriseTask, setSurpriseTask] = useState<Task | null>(null);

  // Submissions
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title,
      description,
      priority,
      category,
      dueDate,
      recurrence
    });

    // Reset fields
    setTitle('');
    setDescription('');
    setPriority('média');
    setCategory('casa');
    setDueDate(todayStr);
    setRecurrence('none');
    setShowAddForm(false);
  };

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDesc(task.description);
    setEditPriority(task.priority);
    setEditCategory(task.category);
    setEditDueDate(task.dueDate);
    setEditRecurrence(task.recurrence || 'none');
  };

  const handleSaveEdit = (id: string) => {
    if (!editTitle.trim()) return;
    updateTask(id, {
      title: editTitle,
      description: editDesc,
      priority: editPriority,
      category: editCategory,
      dueDate: editDueDate,
      recurrence: editRecurrence
    });
    setEditingTaskId(null);
  };

  // Decision paralisys helper "Me Surpreenda"
  const handleSurpriseMe = () => {
    const pending = tasks.filter(t => !t.completed);
    if (pending.length === 0) {
      alert('Não há tarefas pendentes para sortear! Tudo limpo.');
      return;
    }
    const randomIndex = Math.floor(Math.random() * pending.length);
    setSurpriseTask(pending[randomIndex]);
  };

  // Helper: calculate age of pending task from creation
  const getTaskAgeDays = (createdAtStr: string) => {
    const creation = new Date(createdAtStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - creation.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Helper to check if task requires dusty aging display (> 3 days pending)
  const getTaskAgingStyles = (task: Task) => {
    if (task.completed) return { ClassName: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700', isAged: false, ageDays: 0 };
    
    const ageDays = getTaskAgeDays(task.createdAt);
    if (ageDays >= 7) {
      return { 
        ClassName: 'bg-amber-50/70 border-amber-300 dark:border-amber-900/80 dark:bg-amber-950/20 text-yellow-900 dark:text-yellow-100 shadow-md', 
        isAged: true, 
        ageDays,
        dustyMessage: '🕸️ Teia de aranha acumulando! Abandonada há ' + ageDays + ' dias.' 
      };
    } else if (ageDays >= 3) {
      return { 
        ClassName: 'bg-slate-50 border-slate-300 dark:border-slate-700 dark:bg-slate-800/90', 
        isAged: true, 
        ageDays,
        dustyMessage: '⏳ Começando a juntar poeira... Pendente há ' + ageDays + ' dias.' 
      };
    }
    return { ClassName: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700', isAged: false, ageDays };
  };

  // Filtering + Sorting computations
  const filteredTasks = tasks.filter(t => {
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'completed' && t.completed) || 
      (filterStatus === 'pending' && !t.completed);
    return matchesPriority && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'due_date') {
      return a.dueDate.localeCompare(b.dueDate);
    } else if (sortBy === 'priority_high') {
      const priorityWeight = { alta: 3, média: 2, baixa: 1 };
      return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    } else {
      return b.createdAt.localeCompare(a.createdAt);
    }
  });

  // Group completed tasks by Month for historic section
  const completedTasksHistory = tasks.filter(t => t.completed && t.completedAt);
  const completionHistoryByMonth: { [month: string]: Task[] } = {};
  completedTasksHistory.forEach(t => {
    const dateObj = new Date(t.completedAt!);
    const monthYear = dateObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    if (!completionHistoryByMonth[monthYear]) {
      completionHistoryByMonth[monthYear] = [];
    }
    completionHistoryByMonth[monthYear].push(t);
  });

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-sans font-black tracking-tight text-[#2D253D] flex items-center gap-2">
            <span className="p-1 px-2.5 bg-pink-500 text-white rounded-xl text-lg shadow-sm">🌸</span>
            To-do List — Tarefas de Casa
          </h2>
          <p className="text-sm text-[#4B5563] mt-1 font-semibold">
            Organize e ative rotinas de manutenção ou tarefas gerais com envelhecimento visual elegante de itens pendentes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSurpriseMe}
            className="px-4 py-2 bg-pink-50 hover:bg-pink-100/80 text-[#be185d] font-black text-xs uppercase tracking-wider rounded-xl border border-pink-200/60 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Me surpreenda!
          </button>
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-gradient-to-r from-pink-550 to-indigo-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-pink-500/10 flex items-center gap-2 cursor-pointer"
            style={{ backgroundColor: '#be185d' }}
          >
            <Plus className="w-4 h-4" />
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* Me Surpreenda Sorteio Popup Modal */}
      <AnimatePresence>
        {surpriseTask && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-white/95 backdrop-blur-xl max-w-md w-full p-6 rounded-[2rem] border-2 border-pink-200/50 shadow-2xl relative"
            >
              <button 
                onClick={() => setSurpriseTask(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer p-1.5 hover:bg-pink-50 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center animate-spin-slow shadow-inner">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-pink-600 font-mono">Tarefa Sorteada! ✨</span>
                  <h3 className="text-lg font-black text-[#2D253D] mt-1">{surpriseTask.title}</h3>
                </div>
                <p className="text-xs text-slate-655 italic bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  "{surpriseTask.description || 'Sem descrição adicional.'}"
                </p>
                <div className="flex justify-center gap-2.5 text-[10px] font-bold">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full uppercase tracking-wider font-mono capitalize">{surpriseTask.category}</span>
                  <span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full uppercase tracking-wider font-mono">Prazo: {surpriseTask.dueDate.split('-').reverse().join('/')}</span>
                </div>
                
                <div className="pt-4 flex gap-2">
                  <button
                    onClick={() => {
                      toggleTask(surpriseTask.id);
                      setSurpriseTask(null);
                    }}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    Marcar como Concluída!
                  </button>
                  <button
                    onClick={() => setSurpriseTask(null)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task input drawer form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border-2 border-white/60 space-y-4 overflow-hidden shadow-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block pl-1">Título da Tarefa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Limpar condensadora do ar condicionado"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/95 border border-slate-200 rounded-xl focus:border-pink-300 outline-none text-sm font-semibold text-slate-800 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block pl-1">Prazo Limite *</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/95 border border-slate-200 rounded-xl focus:border-pink-300 outline-none text-sm font-mono font-semibold text-slate-800 transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block pl-1">Descrição Detalhada</label>
              <textarea
                rows={2}
                placeholder="Explicar materiais necessários ou passo a passo para a realização..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/95 border border-slate-200 rounded-xl focus:border-pink-300 outline-none text-sm font-semibold text-slate-800 transition"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block pl-1">Prioridade</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold transition text-slate-800"
                >
                  <option value="baixa">Baixa 🟢</option>
                  <option value="média">Média 🟡</option>
                  <option value="alta">Alta 🔴</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block pl-1">Categoria</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as TaskCategory)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold transition text-slate-800"
                >
                  <option value="casa">Casa</option>
                  <option value="trabalho">Trabalho</option>
                  <option value="pessoal">Pessoal</option>
                  <option value="saúde">Saúde</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block pl-1 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 text-pink-500" />
                  Recorrência Inteligente
                </label>
                <select
                  value={recurrence}
                  onChange={e => setRecurrence(e.target.value as Task['recurrence'])}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold transition text-slate-800"
                >
                  <option value="none">Única vez (Sem recorrência)</option>
                  <option value="diaria">Todo dia</option>
                  <option value="semanal">Toda semana</option>
                  <option value="mensal">Todo mês</option>
                  <option value="trimestral">A cada 3 meses</option>
                  <option value="anual">Todo ano</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:brightness-110 transition cursor-pointer"
              >
                Cadastrar Tarefa
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Task control filters rail */}
      <div className="bg-white/65 backdrop-blur-md p-4 rounded-[1.6rem] border border-white/50 flex flex-wrap gap-4 items-center justify-between shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Filter Status */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-black text-[#374151] uppercase tracking-wider pr-1 font-mono">Status:</span>
            <button 
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 text-xs rounded-lg font-bold transition cursor-pointer ${filterStatus === 'all' ? 'bg-[#2D253D] text-white' : 'bg-white/80 border border-slate-200 text-[#4B5563] hover:bg-white'}`}
            >
              Todas
            </button>
            <button 
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1 text-xs rounded-lg font-bold transition cursor-pointer ${filterStatus === 'pending' ? 'bg-[#2D253D] text-white shadow-xs' : 'bg-white/80 border border-slate-200 text-[#4B5563] hover:bg-white'}`}
            >
              Pendentes
            </button>
            <button 
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1 text-xs rounded-lg font-bold transition cursor-pointer ${filterStatus === 'completed' ? 'bg-[#2D253D] text-white' : 'bg-white/80 border border-slate-200 text-[#4B5563] hover:bg-white'}`}
            >
              Histórico
            </button>
          </div>

          {/* Filter Priority */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200/60">
            <span className="text-[11px] font-black text-[#374151] uppercase tracking-wider pr-1 font-mono">Peso:</span>
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-200 text-slate-800 text-xs rounded-lg outline-none font-bold cursor-pointer"
            >
              <option value="all">Todas Prioridades</option>
              <option value="alta">Alta 🔴</option>
              <option value="média">Média 🟡</option>
              <option value="baixa">Baixa 🟢</option>
            </select>
          </div>

          {/* Filter Category */}
          <div className="flex items-center gap-1.5">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-200 text-slate-800 text-xs rounded-lg outline-none font-bold cursor-pointer"
            >
              <option value="all">Todas Categorias</option>
              <option value="casa">Casa</option>
              <option value="trabalho">Trabalho</option>
              <option value="pessoal">Pessoal</option>
              <option value="saúde">Saúde</option>
              <option value="outros">Outros</option>
            </select>
          </div>

        </div>

        {/* Sorting options */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-2 py-1 bg-white border border-slate-200 text-slate-800 text-xs rounded-lg outline-none font-bold cursor-pointer"
          >
            <option value="due_date">Mais Próximas (Prazo)</option>
            <option value="priority_high">Maior Prioridade</option>
            <option value="created">Mais Recentes</option>
          </select>
        </div>
      </div>

      {/* Main Tasks Dynamic List Render */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white/50 backdrop-blur-xs rounded-[2rem] border border-white/60 shadow-xs">
            <Calendar className="w-8 h-8 text-pink-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-500">
              Nenhuma tarefa localizada com os filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map(task => {
              const aging = getTaskAgingStyles(task);
              const isOverdue = !task.completed && task.dueDate < todayStr;
              const isEditing = editingTaskId === task.id;

              // Determinar cores pastéis suaves e leves que combinem com a categoria ou com o tempo de envelhecimento
              let cardBgClass = 'bg-white/85 border-slate-200 shadow-sm';
              if (task.completed) {
                cardBgClass = 'bg-white/50 border-slate-100 opacity-65 backdrop-blur-3xs';
              } else if (aging.isAged) {
                if (aging.ageDays >= 7) {
                  // Ajuste Emergencial de Envelhecimento para Tom de Areia/Bege claro conforme solicitado!
                  cardBgClass = 'bg-[#FDF6E2] border-amber-300 shadow-xs';
                } else {
                  cardBgClass = 'bg-[#FAF5E6] border-orange-250 shadow-3xs';
                }
              } else {
                if (task.category === 'casa') {
                  // Verde menta pastel chic
                  cardBgClass = 'bg-[#f0fdf4] border-[#bbf7d0]/90 shadow-2xs';
                } else if (task.category === 'trabalho') {
                  // Azul-pastel suave
                  cardBgClass = 'bg-[#f0f9ff] border-[#bae6fd]/90 shadow-2xs';
                } else if (task.category === 'pessoal') {
                  // Lilás/Rosa-bebê pastel sutil
                  cardBgClass = 'bg-[#faf5ff] border-[#e9d5ff]/90 shadow-2xs';
                } else if (task.category === 'saúde') {
                  // Rose pastel
                  cardBgClass = 'bg-[#fff1f2] border-[#fecdd3]/90 shadow-2xs';
                } else {
                  // Baunilha suave
                  cardBgClass = 'bg-[#fefbeb] border-[#fef08a]/95 shadow-2xs';
                }
              }

              return (
                <div 
                  key={task.id}
                  className={`p-5 rounded-[1.6rem] border transition-all duration-300 flex flex-col justify-between ${cardBgClass} relative`}
                >
                  {/* Dust/Aging visual warning labels */}
                  {aging.isAged && !task.completed && (
                    <div className={`absolute top-3 right-3 text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full select-none ${
                        aging.ageDays >= 7 ? 'bg-amber-100 text-amber-800 border border-amber-300/30' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {aging.ageDays >= 7 ? '🕸️ Teia 7d+' : '⏳ poeira'}
                    </div>
                  )}

                  {isEditing ? (
                    // Edit form state inside list
                    <div className="space-y-3 w-full">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-[#4B5563]">Título</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-[#4B5563]">Descrição</label>
                        <textarea
                          value={editDesc}
                          onChange={e => setEditDesc(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-[#4B5563]">Prioridade</label>
                          <select
                            value={editPriority}
                            onChange={e => setEditPriority(e.target.value as Priority)}
                            className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                          >
                            <option value="alta">Alta</option>
                            <option value="média">Média</option>
                            <option value="baixa">Baixa</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-[#4B5563]">Categoria</label>
                          <select
                            value={editCategory}
                            onChange={e => setEditCategory(e.target.value as TaskCategory)}
                            className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                          >
                            <option value="casa">Casa</option>
                            <option value="trabalho">Trabalho</option>
                            <option value="pessoal">Pessoal</option>
                            <option value="saúde">Saúde</option>
                            <option value="outros">Outros</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-[#4B5563]">Recorrência</label>
                          <select
                            value={editRecurrence}
                            onChange={e => setEditRecurrence(e.target.value as any)}
                            className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                          >
                            <option value="none">Única</option>
                            <option value="diaria">Diária</option>
                            <option value="semanal">Semanal</option>
                            <option value="mensal">Mensal</option>
                            <option value="trimestral">Trimestral</option>
                            <option value="anual">Anual</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-[#4B5563]">Prazo de Resolução</label>
                        <input
                          type="date"
                          value={editDueDate}
                          onChange={e => setEditDueDate(e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingTaskId(null)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 rounded-lg cursor-pointer font-bold"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(task.id)}
                          className="px-3 py-1.5 bg-[#be185d] text-white rounded-lg flex items-center gap-1 cursor-pointer font-bold text-xs"
                        >
                          <Save className="w-3.5 h-3.5" /> Salvar
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Read display state with absolute compliance to color requirements
                    <div className="flex flex-col justify-between h-full space-y-4">
                      
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`w-5.5 h-5.5 rounded-lg border-2 flex items-center justify-center transition-all mt-0.5 cursor-pointer shrink-0 ${
                              task.completed 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'border-[#2D253D]/30 hover:border-pink-500 bg-white/90 shadow-inner'
                            }`}
                          >
                            {task.completed && <Check className="w-3.5 h-3.5 stroke-[4px]" />}
                          </button>
                          
                          <div className="space-y-1">
                            <h3 className={`text-sm font-bold tracking-tight font-sans ${task.completed ? 'line-through text-slate-400' : 'text-[#1F2937]'}`}>
                              {task.title}
                            </h3>
                            <p className={`text-xs ${task.completed ? 'text-slate-400' : 'text-[#4B5563]'}`}>
                              {task.description || 'Sem descrição cadastrada.'}
                            </p>
                          </div>
                        </div>

                        {/* Dusty status warnings or real physical cobwebs with sand/beige colors */}
                        {aging.isAged && !task.completed && (
                          <div className="text-[11px] font-bold text-[#b45309] pl-8.5 font-mono flex items-center gap-1">
                            <span>{aging.dustyMessage}</span>
                          </div>
                        )}
                      </div>

                      {/* Info footer bar */}
                      <div className="flex items-center justify-between gap-2 border-t border-slate-200/50 pt-3 mt-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Priority badge */}
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider ${
                            task.priority === 'alta' ? 'bg-red-50 text-red-600 border border-red-200/40' :
                            task.priority === 'média' ? 'bg-amber-50 text-amber-700 border border-amber-200/40' :
                            'bg-slate-50 text-slate-500'
                          }`}>
                            {task.priority}
                          </span>

                          {/* Category badge */}
                          <span className="text-[10px] font-mono font-bold capitalize text-slate-500 bg-white/60 border border-slate-100 px-2 py-0.5 rounded-md">
                            {task.category}
                          </span>

                          {/* Recurrence intelligent indicator */}
                          {task.recurrence && task.recurrence !== 'none' && (
                            <span className="text-[10px] text-pink-700 font-bold flex items-center gap-0.5 bg-pink-50 border border-pink-100/60 px-1.5 py-0.5 rounded-md">
                              <RefreshCw className="w-2.5 h-2.5 animate-spin-slow text-pink-500" />
                              {task.recurrence}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-slate-600">
                          {/* Overdue alert */}
                          {isOverdue && (
                            <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-xl font-black font-mono">
                              Atrasada! ⚠️
                            </span>
                          )}

                          <span className="text-[9px] font-mono font-bold text-slate-400">
                            Prazo: {task.dueDate.split('-').reverse().join('/')}
                          </span>

                          <button 
                            onClick={() => handleStartEdit(task)}
                            className="p-1 hover:bg-slate-100 text-slate-400 hover:text-[#1F2937] rounded-lg transition cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          
                          <button 
                            onClick={() => {
                              if (confirm('Excluir esta tarefa definitivamente?')) deleteTask(task.id);
                            }}
                            className="p-1 hover:bg-rose-50 text-rose-400 hover:text-[#be185d] rounded-lg transition cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completion History grouping section */}
      {filterStatus === 'completed' && Object.keys(completionHistoryByMonth).length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200/60">
          <h3 className="text-sm font-black tracking-tight text-[#2D253D] flex items-center gap-2">
            ✨ Histórico de Conclusões Acumulado
          </h3>
          <p className="text-xs text-[#4B5563] pl-1 font-semibold">Filtrado por mês em que você resolveu as pendências.</p>

          <div className="space-y-6 animate-fade-in">
            {Object.entries(completionHistoryByMonth).map(([monthLabel, tasksList]) => (
              <div key={monthLabel} className="bg-white/50 backdrop-blur-3xs p-4 rounded-2xl border border-white/80 shadow-3xs">
                <h4 className="text-[10px] uppercase font-black tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-150 p-1 px-3.5 rounded-full inline-block font-mono mb-3 capitalize">
                  {monthLabel} (Concluídas: {tasksList.length})
                </h4>
                <div className="space-y-1.5 divide-y divide-slate-100/65 pl-2">
                  {tasksList.map(item => (
                    <div key={item.id} className="flex justify-between text-xs py-2 border-b border-dashed border-slate-100 max-w-2xl">
                      <span className="font-semibold text-slate-500 line-through truncate pr-2">
                        {item.title}
                      </span>
                      <span className="font-mono text-slate-400 font-bold shrink-0">
                        resolvida em {new Date(item.completedAt!).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
