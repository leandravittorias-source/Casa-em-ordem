/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppState, QuizQuestion } from '../types';
import { 
  Plus, Trash2, Edit2, ShieldAlert, CheckSquare, Info, 
  Sparkles, TrendingUp, AlertTriangle, Calendar, Check, Save, 
  Activity, X, Zap, DoorOpen, ListTodo, Wrench, Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderIndexViewProps {
  state: AppState;
  submitQuizAnswers: (answers: { [questionId: string]: boolean }) => void;
  setCrisisMode: (crisis: boolean) => void;
  addQuizQuestion: (question: string) => void;
  editQuizQuestion: (id: string, question: string) => void;
  deleteQuizQuestion: (id: string) => void;
}

export default function OrderIndexView({
  state, submitQuizAnswers, setCrisisMode,
  addQuizQuestion, editQuizQuestion, deleteQuizQuestion
}: OrderIndexViewProps) {
  
  const todayStr = new Date().toISOString().split('T')[0];

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '20px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.03)',
  };

  const crisisGlassStyle = {
    background: 'rgba(254, 244, 245, 0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(244, 63, 94, 0.25)',
    borderRadius: '24px',
    boxShadow: '0 15px 25px -5px rgba(244, 63, 94, 0.05)',
  };

  // Survey answers cache
  const [answers, setAnswers] = useState<{ [questionId: string]: boolean }>({});
  
  // Custom question designer toggles
  const [showConfig, setShowConfig] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');

  // Editing questions
  const [editingQId, setEditingQId] = useState<string | null>(null);
  const [editQText, setEditQText] = useState('');

  const handleCheckboxToggle = (qId: string) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.quizQuestions.length === 0) {
      alert('Por favor, adicione pelo menos uma pergunta configurável no designer de questionários antes de submeter.');
      return;
    }
    submitQuizAnswers(answers);
    alert('Índice de ordem doméstico computada com sucesso! Histórico atualizado no banco local.');
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    addQuizQuestion(newQuestionText.trim());
    setNewQuestionText('');
  };

  const handleSaveEditQuestion = (id: string) => {
    if (!editQText.trim()) return;
    editQuizQuestion(id, editQText.trim());
    setEditingQId(null);
  };

  // Calculations
  const hasTakenTodaySurvey = state.quizHistory.some(h => h.date === todayStr);
  const todaySurveyScore = state.quizHistory.find(h => h.date === todayStr)?.score ?? 0;

  // Render index statistics chart (beautiful responsive SVG bars plot)
  const sortedHistory = [...state.quizHistory]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7); // Last 7 metrics

  // 3 critical tasks for Crisis Mode representation
  const crisisTasks = state.tasks
    .filter(t => !t.completed)
    .sort((a, b) => {
      // Priority weights
      const pWeight = { alta: 3, média: 2, baixa: 1 };
      return (pWeight[b.priority] || 0) - (pWeight[a.priority] || 0);
    })
    .slice(0, 3);

  // Dematerialised low stock pantry items for Crisis Mode representation
  const crisisLowStock = state.pantry
    .filter(i => i.quantity <= i.minQuantity)
    .slice(0, 3);

  // Next critical maintenance/compromise
  const nextMaintenance = state.rooms
    .flatMap(r => r.maintenance.map(m => ({ roomName: r.name, color: r.color, ...m })))
    .sort((a, b) => b.date.localeCompare(a.date))[0]; // latest repaired or scheduled repairs if applicable

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in">
      
      {/* Upper header module greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[#2D253D] flex items-center gap-2">
            <span className="p-1 px-2.5 bg-[#2D253D] text-white rounded-lg text-lg">6</span>
            Índice de Ordem & Modo Crise
          </h2>
          <p className="text-sm text-[#4B5563] font-semibold">
            Responda o quiz diário sobre o asseio residencial e ative o painel simplificado sem distrações para emergências de acúmulo de tarefas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Survey Designer config button */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-3.5 py-2 bg-white/70 hover:bg-white border border-white/50 text-[#2D253D] font-extrabold text-[#2D253D] text-[#2D253D] text-xs rounded-xl transition cursor-pointer"
          >
            {showConfig ? 'Fechar Designer' : 'Configurar Perguntas do Quiz'}
          </button>

          {/* Trigger crisis mode manually */}
          <button
            onClick={() => setCrisisMode(!state.crisisMode)}
            className={`px-4 py-2 font-black text-sm rounded-xl transition flex items-center gap-2 cursor-pointer border ${
              state.crisisMode
                ? 'bg-rose-600 text-white border-rose-600 animate-pulse shadow-md'
                : 'bg-white/70 hover:bg-[#FFF1F2] border border-rose-200 text-rose-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            {state.crisisMode ? 'Desativar Modo Crise' : 'Ativar Modo Crise 🚨'}
          </button>
        </div>
      </div>

      {/* Quiz designer settings drawer page form */}
      <AnimatePresence>
        {showConfig && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={glassStyle}
            className="p-5 space-y-4 overflow-hidden"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-[#2D253D] uppercase tracking-wider">Designer do Questionário de Ordem</h3>
                <p className="text-xs text-[#4B5563] font-semibold">Crie ou altere as 3 perguntas cruciais que refletem a harmonia da sua casa particular.</p>
              </div>
              <button onClick={() => setShowConfig(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            {/* List current customized items */}
            <div className="space-y-2 max-w-xl">
              {state.quizQuestions.map(q => {
                const isEditing = editingQId === q.id;
                return (
                  <div key={q.id} className="flex justify-between items-center bg-white/60 p-2.5 rounded-lg border border-slate-201 text-slate-800 font-semibold">
                    {isEditing ? (
                      <div className="flex gap-2 w-full">
                        <input
                          type="text"
                          value={editQText}
                          onChange={e => setEditQText(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-slate-202 bg-white text-xs rounded-xl"
                        />
                        <button onClick={() => handleSaveEditQuestion(q.id)} className="p-1 px-2 text-[10px] bg-emerald-600 rounded text-white cursor-pointer font-bold">Salvar</button>
                        <button onClick={() => setEditingQId(null)} className="p-1 px-2 text-[10px] bg-slate-200 rounded cursor-pointer">X</button>
                      </div>
                    ) : (
                      <>
                        <span className="text-xs font-bold text-[#2D253D]">{q.question}</span>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => {
                              setEditingQId(q.id);
                              setEditQText(q.question);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-900 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm('Deletar esta pergunta do questionário?')) deleteQuizQuestion(q.id);
                            }}
                            className="p-1 text-rose-500 cursor-pointer animate-pulse"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Form to insert new quiz question */}
            <form onSubmit={handleAddQuestion} className="flex gap-2 max-w-xl pt-2 border-t border-slate-105">
              <input
                type="text"
                required
                placeholder="Ex: A mesa de escritório está organizada?"
                value={newQuestionText}
                onChange={e => setNewQuestionText(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-205 bg-white text-xs rounded-xl text-slate-800 font-semibold"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Inserir Questão
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. THE CHOSEN PRESENTATION MODE LAYOUT */}
      {!state.crisisMode ? (
        
        // REGULAR ANALYSIS MODE (Survey + Historical line graph of performance)
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Daily Questionnaire block */}
          <div style={glassStyle} className="lg:col-span-1 p-5 flex flex-col justify-between">
            <div>
              <h3 className="font-sans font-black text-md text-[#2D253D] uppercase tracking-wider flex items-center gap-2 mb-2">
                <CheckSquare className="w-5 h-5 text-yellow-500" />
                Vistoria da Tarde: Índice de Ordem
              </h3>
              <p className="text-xs text-[#4B5563] font-semibold mb-4">
                Assinale as afirmações para gerar o veredito de harmonia e conservação residencial de hoje.
              </p>

              {hasTakenTodaySurvey ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-center text-emerald-800 text-sm">
                  <Sparkles className="w-6 h-6 text-emerald-500 mx-auto animate-bounce" />
                  <p className="font-bold">Quiz diário respondido!</p>
                  <p className="text-xs text-slate-600">Seu índice de asseio computado hoje foi de:</p>
                  <p className="text-3xl font-mono font-black text-emerald-600">{todaySurveyScore}%</p>
                  <p className="text-[10px] text-slate-400 pt-1 font-mono">Você já pode acompanhar a progressão no gráfico lateral.</p>
                </div>
              ) : (
                <form onSubmit={handleSurveySubmit} className="space-y-4">
                  <div className="space-y-2.5">
                    {state.quizQuestions.map(q => (
                      <div 
                        key={q.id} 
                        onClick={() => handleCheckboxToggle(q.id)}
                        className="p-3 bg-white border border-slate-201 rounded-xl flex items-center gap-3 cursor-pointer select-none hover:bg-white/90"
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                          answers[q.id] ? 'bg-yellow-500 border-yellow-500 text-white' : 'border-slate-350 bg-white'
                        }`}>
                          {answers[q.id] && <Check className="w-3.5 h-3.5 stroke-[4px]" />}
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                          {q.question}
                        </span>
                      </div>
                    ))}
                    {state.quizQuestions.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-4">Nenhuma pergunta cadastrada. Use o botão acima para desenhar perguntas.</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-bold rounded-xl transition duration-300 shadow-md shadow-yellow-900/10 cursor-pointer"
                  >
                    Submeter Quiz Diário
                  </button>
                </form>
              )}
            </div>

            <div className="bg-white/40 p-3 rounded-xl border border-slate-201 mt-4 text-[10px] text-slate-500 font-semibold">
              <span className="font-bold block text-[#2D253D] mb-0.5">💡 Dica de conservação residencial:</span>
              Responder o quiz mantêm o histórico calibrado e nos ajuda a alertar você antes que pendências virem uma crise real.
            </div>
          </div>

          {/* Line index metrics chart column */}
          <div style={glassStyle} className="lg:col-span-2 p-6">
            <h3 className="font-sans font-black text-md text-[#2D253D] uppercase tracking-wider flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-yellow-500" />
              Evolução Histórica do Índice Doméstico
            </h3>

            {sortedHistory.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-4">
                <p className="text-xs text-[#4B5563] font-semibold">Nenhum quiz diário submetido para gerar gráficos de asseio.</p>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">Sua pontuação diária aparecerá aqui cobrindo um espectro de 7 medições consecutivas.</p>
              </div>
            ) : (
              <div className="relative h-64 w-full flex items-end justify-between px-2 pt-8">
                
                {/* Horizontal reference threshold lines */}
                <div className="absolute inset-x-0 bottom-8 border-b border-dashed border-slate-205 text-[10px] text-slate-400 font-mono" />
                <div className="absolute inset-x-0 bottom-28 border-b border-dashed border-slate-205 text-[10px] text-slate-400 font-mono" />
                <div className="absolute inset-x-0 bottom-48 border-b border-dashed border-slate-205" />

                {sortedHistory.map((entry, idx) => {
                  const percent = entry.score;
                  const date = entry.date.split('-').reverse().slice(0, 2).join('/'); // DD/MM

                  return (
                    <div key={entry.id} className="flex flex-col items-center flex-1 group z-10">
                      
                      {/* Metric bar representing index */}
                      <div className="w-full flex items-end justify-center h-44 mb-2">
                        <div 
                          className={`relative w-8 rounded-t-lg hover:brightness-110 transition-all flex justify-center ${
                            percent >= 80 ? 'bg-emerald-500 shadow-md' :
                            percent >= 50 ? 'bg-yellow-500 shadow-sm' :
                            'bg-rose-500 shadow-sm animate-pulse'
                          }`}
                          style={{ height: `${Math.max(12, percent)}%` }}
                        >
                          <span className="absolute -top-7 text-[10px] font-mono font-black bg-slate-900 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none whitespace-nowrap">
                            Score: {percent}%
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono font-bold text-slate-650">{date}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-center items-center gap-6 mt-4 text-[10px] font-black uppercase font-mono text-slate-500">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded" />
                <span>80-100% (Harmônico)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-yellow-500 rounded" />
                <span>50-79% (Atenção)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded animate-pulse" />
                <span>0-49% (Crise)</span>
              </div>
            </div>
          </div>

        </div>
      ) : (

        // 3. SPECIAL COMPACT REVOLUTIONARY ZERO RUÍDO CRISIS MODE VIEW (Beautiful light pastel pink theme for aesthetic feminine style!)
        <div style={crisisGlassStyle} className="max-w-2xl mx-auto p-6 relative space-y-6">
          <div className="absolute top-4 right-4 text-xs font-mono bg-rose-600 text-white px-2.5 py-0.5 rounded-full font-bold animate-pulse">
            🚨 Modo Crise Ativado
          </div>

          <div className="border-b border-rose-200 pb-3">
            <h3 className="font-sans font-black text-2xl text-rose-800 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-rose-600 animate-bounce" />
              Painel de Emergência Simplificado
            </h3>
            <p className="text-xs text-rose-700 font-semibold mt-1">
              Esquema de asseio reduzido a zero ruído. Resolvemos apenas o estoque e manutenções críticas para que você recupere as rédeas da habitação.
            </p>
          </div>

          {/* Sub block: 3 most urgent tasks */}
          <div className="space-y-2">
            <h4 className="text-xs font-sans font-black text-[#2D253D] uppercase tracking-widest flex items-center gap-1.5 border-b border-rose-200 pb-1">
              <ListTodo className="w-4 h-4 text-rose-500" />
              As 3 Tarefas Mais Urgentes
            </h4>

            <div className="space-y-1.5 select-none">
              {crisisTasks.map(item => (
                <div key={item.id} className="p-3 bg-white border border-rose-100 rounded-xl flex items-center justify-between text-xs font-bold text-slate-800">
                  <div>
                    <span className="text-slate-900 block font-black">{item.title}</span>
                    <span className="text-[10px] text-slate-500 font-semibold font-mono">Prazo: {item.dueDate.split('-').reverse().join('/')}</span>
                  </div>
                  <span className="text-[10px] uppercase font-black tracking-wider bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-lg border border-rose-200">
                    {item.priority}
                  </span>
                </div>
              ))}
              {crisisTasks.length === 0 && (
                <p className="text-[11px] italic text-[#4B5563] py-2 text-center font-semibold">Nenhuma tarefa pendente registrada!</p>
              )}
            </div>
          </div>

          {/* Sub block: pantry deficiencies */}
          <div className="space-y-2">
            <h4 className="text-xs font-sans font-black text-[#2D253D] uppercase tracking-widest flex items-center gap-1.5 border-b border-rose-200 pb-1">
              <Package className="w-4 h-4 text-rose-500" />
              Estoque Praticamente Vazio
            </h4>

            <div className="space-y-1.5 text-xs font-bold">
              {crisisLowStock.map(item => (
                <div key={item.id} className="p-2.5 w-full bg-white border border-rose-100 rounded-xl flex justify-between">
                  <span className="text-slate-800 capitalize font-bold">{item.name}</span>
                  <span className="text-rose-600 font-extrabold font-mono">Restam apenas {item.quantity} unidades (Min: {item.minQuantity})</span>
                </div>
              ))}
              {crisisLowStock.length === 0 && (
                <p className="text-[11px] italic text-[#4B5563] py-2 text-center font-semibold">Nenhum déficit crítico alimentar na despensa!</p>
              )}
            </div>
          </div>

          {/* Sub block: next commitment */}
          {nextMaintenance && (
            <div className="p-4 bg-white border border-rose-200 rounded-2xl space-y-2 text-xs text-slate-800">
              <h4 className="font-extrabold uppercase tracking-wider text-[#2D253D] font-sans flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-rose-500" />
                Compromisso Crítico Recente
              </h4>
              <p className="font-black text-rose-700 text-sm">Reparo: {nextMaintenance.description}</p>
              <p className="text-[10px] text-slate-500 font-semibold font-mono">Executado no cômodo "{nextMaintenance.roomName}" por R$ {nextMaintenance.cost.toFixed(2)} em {nextMaintenance.date.split('-').reverse().join('/')}.</p>
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button
              onClick={() => setCrisisMode(false)}
              className="py-2.5 px-6 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl text-sm font-extrabold shadow-md cursor-pointer transition"
            >
              Retornar ao Modo Normal ✨
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
