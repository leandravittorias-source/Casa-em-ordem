/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  AppState, Task, PurchaseItem, PurchaseCategory, PantryItem, 
  Room, Habit, NightlyChecklistItem, WeeklyEnergy, SeasonalTask, 
  QuizQuestion, QuizHistoryEntry, CriticalContact, LostObject, 
  BorrowedItem, DelegationMission, AppThemeColors, UserProfile, Priority, TaskCategory,
  PurchaseHistoryMonth, CustomTheme
} from '../types';

const INITIAL_LOCAL_STORAGE_KEY = 'casa_em_ordem_app_state_v1';

const DEFAULT_THEMES: CustomTheme[] = [
  { id: 'dt-1', name: 'Pôr do Sol Suave 🌅', primary: '#f43f5e', secondary: '#fb923c', accent: '#ec4899', backgroundLight: '#fdf2f2' },
  { id: 'dt-2', name: 'Alecrim & Hortelã 🌿', primary: '#0f765e', secondary: '#0d9488', accent: '#10b981', backgroundLight: '#f0fdfa' },
  { id: 'dt-3', name: 'Brisa Lavanda 🪻', primary: '#6d28d9', secondary: '#8b5cf6', accent: '#db2777', backgroundLight: '#faf5ff' },
  { id: 'dt-4', name: 'Café Cozy ☕', primary: '#78350f', secondary: '#b45309', accent: '#d97706', backgroundLight: '#fdfbeb' }
];

const DEFAULT_COLORS: AppThemeColors = {
  primary: '#6366f1', // Vibrant slate/indigo
  secondary: '#3b82f6', // Sky/Vibrant blue
  accent: '#10b981', // Emerald green
  backgroundLight: '#f8fafc',
  backgroundDark: '#0f172a',
  cardLight: '#ffffff',
  cardDark: '#1e293b'
};

const DEFAULT_QUESTIONS: QuizQuestion[] = [
  { id: 'q1', question: 'A pia da cozinha está limpa e livre de louças?' },
  { id: 'q2', question: 'As tarefas prioritárias do dia foram concluídas?' },
  { id: 'q3', question: 'O lixo foi retirado e há ordem visual nas salas principais?' }
];

const DEFAULT_STATE: AppState = {
  tasks: [
    {
      id: 'task-1',
      title: 'Limpar filtro do ar condicionado',
      description: 'Filtro do quarto de casal está acumulando poeira e o aparelho está perdendo força. Lavar e secar bem antes de recolocar.',
      priority: 'alta',
      category: 'casa',
      dueDate: '2026-05-28', // Already Overdue in Jun 2026! For dust aging effect
      completed: false,
      createdAt: '2026-05-15T10:00:00Z',
      recurrence: 'trimestral'
    },
    {
      id: 'task-2',
      title: 'Revisar extintor de incêndio',
      description: 'Verificar se a pressão está na faixa verde e a validade da carga anual está correta.',
      priority: 'média',
      category: 'saúde',
      dueDate: '2026-06-15',
      completed: false,
      createdAt: '2026-06-01T08:00:00Z',
      recurrence: 'anual'
    },
    {
      id: 'task-3',
      title: 'Organizar armário do escritório',
      description: 'Separar recibos fiscais antigos e arquivar pastas de novos contratos.',
      priority: 'baixa',
      category: 'trabalho',
      dueDate: '2026-06-05',
      completed: true,
      completedAt: '2026-06-01T14:00:00Z',
      createdAt: '2026-06-01T08:00:00Z'
    },
    {
      id: 'task-4',
      title: 'Lavar janelas externas',
      description: 'Aproveitar o clima quente para tirar as manchas de poeira e chuva.',
      priority: 'baixa',
      category: 'casa',
      dueDate: '2026-06-10',
      completed: false,
      createdAt: '2026-06-01T09:00:00Z'
    }
  ],
  purchases: [
    { id: 'p1', name: 'Alface Americana', category: 'hortifruti', quantity: 2, unitPrice: 4.5, purchased: false },
    { id: 'p2', name: 'Leite Desnatado 1L', category: 'mercearia', quantity: 6, unitPrice: 5.2, purchased: true, purchasedAt: '2026-06-01' },
    { id: 'p3', name: 'Detergente Neutro', category: 'limpeza', quantity: 3, unitPrice: 2.1, purchased: false },
    { id: 'p4', name: 'Manteiga com Sal', category: 'frios', quantity: 1, unitPrice: 12.9, purchased: false },
    { id: 'p5', name: 'Sabonete Líquido', category: 'higiene', quantity: 2, unitPrice: 7.4, purchased: true, purchasedAt: '22026-06-01' }
  ],
  purchasePriceRadar: {
    'Alface Americana': [4.2, 4.5],
    'Leite Desnatado 1L': [4.9, 5.0, 5.2],
    'Detergente Neutro': [1.9, 2.1],
    'Manteiga com Sal': [11.8, 12.9]
  },
  purchaseHistory: [
    {
      id: '2026-05',
      monthLabel: 'Maio/2026',
      items: [
        { id: 'old-1', name: 'Mamão Formosa', category: 'hortifruti', quantity: 1, unitPrice: 8.9, purchased: true },
        { id: 'old-2', name: 'Arroz Integral 5kg', category: 'mercearia', quantity: 1, unitPrice: 24.9, purchased: true },
        { id: 'old-3', name: 'Papel Higiênico 12un', category: 'higiene', quantity: 1, unitPrice: 18.5, purchased: true }
      ],
      totalGasto: 52.3
    }
  ],
  currentPurchaseMonth: '2026-06',
  purchaseCorridorOrder: ['hortifruti', 'frios', 'mercearia', 'bebidas', 'higiene', 'limpeza', 'outros'],
  pantry: [
    { id: 'pan-1', name: 'Arroz Sete Grãos', category: 'mercearia', quantity: 1, minQuantity: 2, rating: 5, review: 'Excelente qualidade, cozinha super rápido.', buyAgain: 'sim' },
    { id: 'pan-2', name: 'Filtro de Café N3', category: 'mercearia', quantity: 3, minQuantity: 1, rating: 4, review: 'Muito bom, não rasga fácil.', buyAgain: 'sim' },
    { id: 'pan-3', name: 'Desinfetante de Pinho', category: 'limpeza', quantity: 0, minQuantity: 1 },
    { id: 'pan-4', name: 'Queijo Muçarela fatiado', category: 'frios', quantity: 0.2, minQuantity: 0.5, rating: 3, review: 'Bom sabor mas junta soro rápido.', buyAgain: 'talvez' }
  ],
  rooms: [
    {
      id: 'room-1',
      name: 'Cozinha',
      color: '#10b981',
      iconName: 'ChefHat',
      criticalInfo: 'Registro geral de água fica embaixo da pia principal, acionado girando em sentido anti-horário.',
      checklist: [
        { id: 'rc-1-1', label: 'Esvaziar e limpar gaveta de talheres', checked: false },
        { id: 'rc-1-2', label: 'Limpar forno e micro-ondas por dentro', checked: true },
        { id: 'rc-1-3', label: 'Descongelar e limpar geladeira', checked: false }
      ],
      photos: [
        { id: 'rph-1', photoUrl: '', note: 'Ganchos de temperos instalados próximos ao fogão.', date: '2026-05-10' }
      ],
      maintenance: [
        { id: 'mnt-1', date: '2026-03-12', description: 'Troca da torneira monocomando (vazamento na base)', cost: 180.0 }
      ],
      objects: ['Faqueiro de prata', 'Liquidificador profissional', 'Chave reserva da despensa']
    },
    {
      id: 'room-2',
      name: 'Sala de Estar',
      color: '#8b5cf6',
      iconName: 'Tv',
      criticalInfo: 'Disjuntor de iluminação geral da sala fica no quadro de energia atrás do espelho do corredor.',
      checklist: [
        { id: 'rc-2-1', label: 'Aspirar frestas do sofá', checked: false },
        { id: 'rc-2-2', label: 'Limpar poeira do painel da TV e cabos', checked: false }
      ],
      photos: [],
      maintenance: [],
      objects: ['Controle universal', 'Roteador Wi-Fi principal', 'Cabos HDMI sobressalentes']
    }
  ],
  habits: [
    {
      id: 'h-1',
      name: 'Beber 2.5L de água',
      frequency: 'diário',
      streak: 5,
      lastCompleted: '2026-05-31',
      history: ['2026-05-27', '2026-05-28', '2026-05-29', '2026-05-30', '2026-05-31'],
      createdAt: '2026-05-01'
    },
    {
      id: 'h-2',
      name: 'Leitura antes de dormir',
      frequency: 'diário',
      streak: 2,
      lastCompleted: '2026-05-31',
      history: ['2026-05-30', '2026-05-31'],
      createdAt: '2026-05-10'
    },
    {
      id: 'h-3',
      name: 'Regar as plantas do quintal',
      frequency: 'semanal',
      streak: 1,
      lastCompleted: '2026-05-29',
      history: ['2026-05-15', '2026-05-22', '2026-05-29'],
      createdAt: '2026-05-01'
    }
  ],
  nightlyRoutine: [
    { id: 'n1', label: 'Trancar todas as portas e portões', checked: false },
    { id: 'n2', label: 'Verificar se o gás da cozinha está fechado', checked: false },
    { id: 'n3', label: 'Colocar o lixo para fora no cesto', checked: false },
    { id: 'n4', label: 'Programar a lavadora de louças', checked: false }
  ],
  weeklyEnergy: 'média',
  energySetDate: '2026-05-31',
  seasonalTasks: [
    { id: 'st-1', title: 'Limpeza profunda das calhas', month: 4, description: 'Prevenir entupimentos antes das chuvas de verão.', completedYears: [2025] },
    { id: 'st-2', title: 'Lavagem técnica de tapetes e cortinas', month: 8, description: 'Aproveitar o mês de setembro para secar rápido com Sol.', completedYears: [] },
    { id: 'st-3', title: 'Revisão das borrachas das janelas', month: 11, description: 'Evitar infiltrações e correntes de ar frio no inverno.', completedYears: [2025] }
  ],
  quizQuestions: DEFAULT_QUESTIONS,
  quizHistory: [
    { id: 'qh-1', date: '2026-05-30', score: 66, answers: { 'q1': true, 'q2': false, 'q3': true } },
    { id: 'qh-2', date: '2026-05-31', score: 100, answers: { 'q1': true, 'q2': true, 'q3': true } }
  ],
  crisisMode: false,
  criticalContacts: [
    { id: 'cc-1', title: 'Apólice Seguro Porto', value: 'Número 4981-017 / Assistência 24h: 3003-1000', category: 'emergência' },
    { id: 'cc-2', title: 'Eletricista Roberto Técnico', value: 'Celular: (11) 98888-2211 / Atende urgências aos fins de semana', category: 'emergência' },
    { id: 'cc-3', title: 'Código Alarme Residência', value: 'Senha Coação: 9911 / Ativar geral: *5# 4811', category: 'emergência' },
    { id: 'cc-4', title: 'Localização Chave de Emergência', value: 'Caixa de pedra falsa no jardim de inverno perto da palmeira.', category: 'localização' }
  ],
  lostObjects: [
    { id: 'lo-1', name: 'Chaves reserva do portão externo', lastSeenLocation: 'Gaveta de madeira do aparador do hall de entrada', updatedAt: '2026-05-20T11:00:00Z' },
    { id: 'lo-2', name: 'Passaportes e vistos antigos', lastSeenLocation: 'Pasta sanfonada preta na prateleira superior do escritório', updatedAt: '2026-05-25T14:30:00Z' }
  ],
  borrowedItems: [
    { id: 'bi-1', name: 'Furadeira Bosch 750W', personName: 'Vizinho Marcos (Apto 42)', date: '2026-05-18', type: 'emprestado_para', returned: false },
    { id: 'bi-2', name: 'Livro "A Arte de Fazer Acontecer"', personName: 'Mariana Duarte', date: '2026-05-22', type: 'pego_emprestado_de', returned: false }
  ],
  missions: [
    {
      id: 'm-1',
      title: 'Instalação do novo ar-condicionado',
      recipient: 'Técnico Júlio',
      instructions: 'Acompanhar a quebra da parede. Explicar onde o dreno deve desaguar. Fornecer água e café.',
      suppliesNeeded: 'Extensão de energia de 10m, escada de alumínio de 6 degraus.',
      locationOfSupplies: 'Escada está na área de serviço externa, extensão debaixo do rack da TV.',
      tasks: [
        { id: 'mt-1-1', label: 'Retirar o móvel do quarto para dar espaço à escada', checked: true },
        { id: 'mt-1-2', label: 'Cobrir a cama com lençol de proteção contra poeira', checked: true },
        { id: 'mt-1-3', label: 'Fornecer a fita veda-rosca adicional solicitada', checked: false },
        { id: 'mt-1-4', label: 'Confirmar o teste do dreno jogando uma garrafa d\'água', checked: false }
      ],
      createdAt: '2026-05-29T15:00:00Z'
    }
  ],
  userProfile: {
    name: 'Leandra Vittoria',
    avatarUrl: '' // Base64 empty to fallback to initial representation
  },
  affectiveMemories: [
    { id: 'mem-1', title: 'Churrasco de Boas-Vindas', description: 'Dia em que inauguramos a churrasqueira da varanda com toda a família reunida rindo.', photoUrl: '', date: '2026-05-10' }
  ],
  timeCapsules: [
    { id: 'cap-1', title: 'Minhas Metas de Resolução', message: 'Como estou me sentindo hoje, espero que ao abrir esta cápsula estejamos mais calmos e organizados.', unlockDate: '2026-12-31', createdAt: '2026-06-01T12:00:00Z' }
  ],
  theme: 'claro',
  colors: DEFAULT_COLORS,
  savedThemes: DEFAULT_THEMES,
  cats: [
    {
      id: 'cat-1',
      name: 'Amora',
      photoUrl: '',
      vaccines: [
        { id: 'v-1-1', name: 'Tríplice Felina (F3)', appliedDate: '2025-06-15', nextDoseDate: '2026-06-15' }
      ],
      vetRecords: [
        { id: 'vt-1-1', date: '2026-02-10', weight: 4.2, reason: 'Consulta preventiva anual e retorno geral', cost: 150 }
      ]
    },
    {
      id: 'cat-2',
      name: 'Pipoca',
      photoUrl: '',
      vaccines: [
        { id: 'v-2-1', name: 'Quádrupla Felina (F4)', appliedDate: '2025-10-20', nextDoseDate: '2026-10-20' }
      ],
      vetRecords: [
        { id: 'vt-2-1', date: '2026-01-15', weight: 3.8, reason: 'Revisão de rotina', cost: 120 }
      ]
    },
    {
      id: 'cat-3',
      name: 'Mel',
      photoUrl: '',
      vaccines: [
        { id: 'v-3-1', name: 'Antirrábica Felina', appliedDate: '2025-08-05', nextDoseDate: '2026-08-05' }
      ],
      vetRecords: [
        { id: 'vt-3-1', date: '2026-03-22', weight: 4.1, reason: 'Check-up de dentes e ouvidos', cost: 140 }
      ]
    }
  ],
  petSupplies: [
    {
      id: 'sup-1',
      type: 'ração',
      brand: 'PremieR Gatos Castrados Salmão 7.5kg',
      quantity: '7.5kg',
      openedDate: '2026-05-10',
      finished: false
    },
    {
      id: 'sup-2',
      type: 'areia',
      brand: 'Viva Verde Areia Biodegradável Canário 4kg',
      quantity: '4kg',
      openedDate: '2026-05-18',
      finished: false
    }
  ]
};

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(INITIAL_LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure defaults are present in loaded state to avoid errors from schema changes
        return {
          ...DEFAULT_STATE,
          ...parsed,
          userProfile: { ...DEFAULT_STATE.userProfile, ...parsed.userProfile },
          colors: { ...DEFAULT_STATE.colors, ...parsed.colors },
          quizQuestions: parsed.quizQuestions || DEFAULT_STATE.quizQuestions,
          nightlyRoutine: parsed.nightlyRoutine || DEFAULT_STATE.nightlyRoutine,
          affectiveMemories: parsed.affectiveMemories || DEFAULT_STATE.affectiveMemories,
          timeCapsules: parsed.timeCapsules || DEFAULT_STATE.timeCapsules,
          savedThemes: parsed.savedThemes || DEFAULT_THEMES,
          cats: parsed.cats || DEFAULT_STATE.cats,
          petSupplies: parsed.petSupplies || DEFAULT_STATE.petSupplies
        };
      }
    } catch (e) {
      console.error('Erro ao ler do localStorage', e);
    }
    return DEFAULT_STATE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(INITIAL_LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Erro ao salvar no localStorage', e);
    }
  }, [state]);

  // General theme / settings handlers
  const toggleTheme = () => {
    setState(prev => ({
      ...prev,
      theme: prev.theme === 'claro' ? 'escuro' : 'claro'
    }));
  };

  const updateColors = (newColors: Partial<AppThemeColors>) => {
    setState(prev => ({
      ...prev,
      colors: { ...prev.colors, ...newColors }
    }));
  };

  const resetColors = () => {
    setState(prev => ({
      ...prev,
      colors: DEFAULT_COLORS
    }));
  };

  const updateProfile = (name: string, avatarUrl?: string) => {
    setState(prev => ({
      ...prev,
      userProfile: {
        name,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : prev.userProfile.avatarUrl
      }
    }));
  };

  // Module 1: To-Do list
  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      completed: false,
      createdAt: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));
  };

  const updateTask = (id: string, updatedFields: Partial<Task>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updatedFields } : t)
    }));
  };

  const toggleTask = (id: string) => {
    setState(prev => {
      const isCompleted = prev.tasks.find(t => t.id === id)?.completed;
      const updatedTasks = prev.tasks.map(t => {
        if (t.id === id) {
          const completedVal = !t.completed;
          let recurrenceTask: Task | null = null;
          
          return {
            ...t,
            completed: completedVal,
            completedAt: completedVal ? new Date().toISOString() : undefined
          };
        }
        return t;
      });

      // Handle Intelligent Recurring Tasks
      const originTask = prev.tasks.find(t => t.id === id);
      if (originTask && !originTask.completed && originTask.recurrence && originTask.recurrence !== 'none') {
        // Automatically spawn the next task occurrence!
        const nextDueDate = calculateNextRecurrenceDate(originTask.dueDate, originTask.recurrence);
        const nextTask: Task = {
          ...originTask,
          id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          dueDate: nextDueDate,
          completed: false,
          createdAt: new Date().toISOString(),
          description: `[Recorrente: ${originTask.recurrence}] ${originTask.description}`
        };
        updatedTasks.push(nextTask);
      }

      return {
        ...prev,
        tasks: updatedTasks
      };
    });
  };

  const deleteTask = (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
  };

  // Helper calculation for recurring tasks
  function calculateNextRecurrenceDate(currentDueDateStr: string, recurrence: Task['recurrence']): string {
    const date = new Date(currentDueDateStr + 'T12:00:00'); // set mid day to prevent timezone shifts
    if (isNaN(date.getTime())) {
      const now = new Date();
      return now.toISOString().split('T')[0];
    }
    switch (recurrence) {
      case 'diaria':
        date.setDate(date.getDate() + 1);
        break;
      case 'semanal':
        date.setDate(date.getDate() + 7);
        break;
      case 'mensal':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'trimestral':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'anual':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        break;
    }
    return date.toISOString().split('T')[0];
  }

  // Module 2: Shopping List (Lista de Compras)
  const addPurchaseItem = (item: Omit<PurchaseItem, 'id' | 'purchased'>) => {
    const newItem: PurchaseItem = {
      ...item,
      id: `p-${Date.now()}`,
      purchased: false
    };
    setState(prev => {
      // Add price tracking radar info if a price was inputted
      const historical = prev.purchasePriceRadar[item.name] || [];
      const updatedRadar = {
        ...prev.purchasePriceRadar,
        [item.name]: item.unitPrice > 0 ? [...historical, item.unitPrice] : historical
      };

      return {
        ...prev,
        purchases: [...prev.purchases, newItem],
        purchasePriceRadar: updatedRadar
      };
    });
  };

  const updatePurchaseItem = (id: string, updatedFields: Partial<PurchaseItem>) => {
    setState(prev => {
      const original = prev.purchases.find(p => p.id === id);
      const updatedPurchases = prev.purchases.map(p => p.id === id ? { ...p, ...updatedFields } : p);
      let updatedRadar = prev.purchasePriceRadar;

      if (original && updatedFields.unitPrice !== undefined && updatedFields.unitPrice > 0) {
        const itemName = updatedFields.name || original.name;
        const historical = prev.purchasePriceRadar[itemName] || [];
        updatedRadar = {
          ...prev.purchasePriceRadar,
          [itemName]: [...historical, updatedFields.unitPrice]
        };
      }

      return {
        ...prev,
        purchases: updatedPurchases,
        purchasePriceRadar: updatedRadar
      };
    });
  };

  const togglePurchaseItem = (id: string) => {
    setState(prev => {
      const target = prev.purchases.find(p => p.id === id);
      const wasPurchased = target?.purchased;
      
      const updatedPurchases = prev.purchases.map(p => {
        if (p.id === id) {
          const finishedState = !p.purchased;
          return {
            ...p,
            purchased: finishedState,
            purchasedAt: finishedState ? new Date().toISOString().split('T')[0] : undefined
          };
        }
        return p;
      });

      // Also trigger Price Radar records on purchase completing
      let updatedRadar = prev.purchasePriceRadar;
      if (target && !wasPurchased && target.unitPrice > 0) {
        const historical = prev.purchasePriceRadar[target.name] || [];
        if (!historical.includes(target.unitPrice)) {
          updatedRadar = {
            ...prev.purchasePriceRadar,
            [target.name]: [...historical, target.unitPrice]
          };
        }
      }

      return {
        ...prev,
        purchases: updatedPurchases,
        purchasePriceRadar: updatedRadar
      };
    });
  };

  const deletePurchaseItem = (id: string) => {
    setState(prev => ({
      ...prev,
      purchases: prev.purchases.filter(p => p.id !== id)
    }));
  };

  // Archive list automatically when month switches (or manually)
  const archiveCurrentList = () => {
    if (state.purchases.length === 0) return;

    setState(prev => {
      const currentMonth = prev.currentPurchaseMonth;
      const monthLabelParts = currentMonth.split('-');
      const year = monthLabelParts[0];
      const monthNum = parseInt(monthLabelParts[1]);
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      const monthLabel = `${monthNames[monthNum - 1]}/${year}`;

      const totalGasto = prev.purchases
        .filter(p => p.purchased)
        .reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);

      const archivedMonth: PurchaseHistoryMonth = {
        id: currentMonth,
        monthLabel,
        items: [...prev.purchases],
        totalGasto
      };

      // Calculate next month identifier
      let nextMonthNum = monthNum + 1;
      let nextYear = parseInt(year);
      if (nextMonthNum > 12) {
        nextMonthNum = 1;
        nextYear += 1;
      }
      const nextMonthStr = `${nextYear}-${String(nextMonthNum).padStart(2, '0')}`;

      // Highlighting: carry over uncompleted (outstanding) items to the next month
      const uncompletedItems = prev.purchases
        .filter(p => !p.purchased)
        .map(p => ({
          ...p,
          id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}` // Refresh IDs for new month
        }));

      return {
        ...prev,
        purchaseHistory: [archivedMonth, ...prev.purchaseHistory.filter(h => h.id !== currentMonth)],
        purchases: uncompletedItems, // Month starts with high-lighted items not bought
        currentPurchaseMonth: nextMonthStr
      };
    });
  };

  // Duplicate list of specific old month
  const duplicateMonthList = (monthId: string) => {
    const historicalMonth = state.purchaseHistory.find(h => h.id === monthId);
    if (!historicalMonth) return;

    setState(prev => {
      // Clear current purchases or stack them
      const duplicatedItems = historicalMonth.items.map(item => ({
        ...item,
        id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        purchased: false,
        purchasedAt: undefined
      }));

      return {
        ...prev,
        purchases: [...prev.purchases, ...duplicatedItems]
      };
    });
  };

  const updateCorridorOrder = (categoriesOrder: string[]) => {
    setState(prev => ({
      ...prev,
      purchaseCorridorOrder: categoriesOrder
    }));
  };

  // Module 3: Pantry (Despensa)
  const addPantryItem = (item: Omit<PantryItem, 'id'>) => {
    const newItem: PantryItem = {
      ...item,
      id: `pan-${Date.now()}`
    };
    setState(prev => ({
      ...prev,
      pantry: [...prev.pantry, newItem]
    }));
  };

  const updatePantryItem = (id: string, updatedFields: Partial<PantryItem>) => {
    setState(prev => ({
      ...prev,
      pantry: prev.pantry.map(item => item.id === id ? { ...item, ...updatedFields } : item)
    }));
  };

  const deletePantryItem = (id: string) => {
    setState(prev => ({
      ...prev,
      pantry: prev.pantry.filter(item => item.id !== id)
    }));
  };

  // Send below-minimum pantry items to current shopping list
  const sendItemsBelowMinToShoppingList = () => {
    const lowItems = state.pantry.filter(item => item.quantity <= item.minQuantity);
    if (lowItems.length === 0) return;

    setState(prev => {
      const addedPurchases: PurchaseItem[] = lowItems.map(item => {
        // Calculate needed quantity: diff up to min, or at least double the minimum to hold stock
        const neededQty = Math.max(1, Math.ceil(item.minQuantity * 2 - item.quantity));
        
        // Find if this item name is already in purchases
        return {
          id: `p-pantry-${item.id}-${Date.now()}`,
          name: item.name,
          category: convertPantryCategoryToPurchaseCategory(item.category),
          quantity: neededQty,
          unitPrice: 0, // initially 0 or estimate if inside PriceRadar
          purchased: false
        };
      });

      // Filter out duplicates (if item name already exists in current cart)
      const currentNames = prev.purchases.map(p => p.name.toLowerCase().trim());
      const nonDuplicateAdded = addedPurchases.filter(ap => !currentNames.includes(ap.name.toLowerCase().trim()));

      return {
        ...prev,
        purchases: [...prev.purchases, ...nonDuplicateAdded]
      };
    });
  };

  function convertPantryCategoryToPurchaseCategory(pantryCat: string): PurchaseCategory {
    const cat = pantryCat.toLowerCase();
    if (['hortifruti', 'verduras', 'frutas'].includes(cat)) return 'hortifruti';
    if (['limpeza', 'casa'].includes(cat)) return 'limpeza';
    if (['higiene', 'pessoal'].includes(cat)) return 'higiene';
    if (['frios', 'laticínios', 'congelados'].includes(cat)) return 'frios';
    if (['bebidas'].includes(cat)) return 'bebidas';
    if (['mercearia', 'grãos', 'temperos'].includes(cat)) return 'mercearia';
    return 'outros';
  }

  // Module 4: Home Map (Mapa da Casa)
  const addRoom = (room: Omit<Room, 'id' | 'checklist' | 'photos' | 'maintenance' | 'objects'>) => {
    const newRoom: Room = {
      ...room,
      id: `room-${Date.now()}`,
      checklist: [
        { id: `rc-${Date.now()}-1`, label: 'Limpeza geral das superfícies', checked: false },
        { id: `rc-${Date.now()}-2`, label: 'Organizar objetos espalhados', checked: false }
      ],
      photos: [],
      maintenance: [],
      objects: []
    };
    setState(prev => ({
      ...prev,
      rooms: [...prev.rooms, newRoom]
    }));
  };

  const updateRoom = (roomId: string, updatedFields: Partial<Room>) => {
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => r.id === roomId ? { ...r, ...updatedFields } : r)
    }));
  };

  const deleteRoom = (roomId: string) => {
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.filter(r => r.id !== roomId)
    }));
  };

  const addRoomChecklistItem = (roomId: string, label: string) => {
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => {
        if (r.id === roomId) {
          const newItem = { id: `rc-${Date.now()}`, label, checked: false };
          return { ...r, checklist: [...r.checklist, newItem] };
        }
        return r;
      })
    }));
  };

  const toggleRoomChecklistItem = (roomId: string, itemId: string) => {
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => {
        if (r.id === roomId) {
          return {
            ...r,
            checklist: r.checklist.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item)
          };
        }
        return r;
      })
    }));
  };

  const deleteRoomChecklistItem = (roomId: string, itemId: string) => {
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => {
        if (r.id === roomId) {
          return {
            ...r,
            checklist: r.checklist.filter(item => item.id !== itemId)
          };
        }
        return r;
      })
    }));
  };

  const addRoomPhoto = (roomId: string, photoUrl: string, note: string) => {
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => {
        if (r.id === roomId) {
          const newPhoto = {
            id: `rph-${Date.now()}`,
            photoUrl,
            note,
            date: new Date().toISOString().split('T')[0]
          };
          return { ...r, photos: [newPhoto, ...r.photos] };
        }
        return r;
      })
    }));
  };

  const deleteRoomPhoto = (roomId: string, photoId: string) => {
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => {
        if (r.id === roomId) {
          return { ...r, photos: r.photos.filter(p => p.id !== photoId) };
        }
        return r;
      })
    }));
  };

  const addRoomMaintenance = (roomId: string, description: string, cost: number, date: string) => {
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => {
        if (r.id === roomId) {
          const newMnt = {
            id: `mnt-${Date.now()}`,
            date,
            description,
            cost
          };
          return { ...r, maintenance: [newMnt, ...r.maintenance] };
        }
        return r;
      })
    }));
  };

  const deleteRoomMaintenance = (roomId: string, maintenanceId: string) => {
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => {
        if (r.id === roomId) {
          return { ...r, maintenance: r.maintenance.filter(m => m.id !== maintenanceId) };
        }
        return r;
      })
    }));
  };

  const addRoomObject = (roomId: string, objectName: string) => {
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => {
        if (r.id === roomId) {
          return { ...r, objects: [...r.objects, objectName] };
        }
        return r;
      })
    }));
  };

  const removeRoomObject = (roomId: string, objectName: string) => {
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => {
        if (r.id === roomId) {
          return { ...r, objects: r.objects.filter(o => o !== objectName) };
        }
        return r;
      })
    }));
  };

  // Module 5: Habits & Rotines (Rotinas & Hábitos)
  const addHabit = (name: string, frequency: 'diário' | 'semanal') => {
    const newHabit: Habit = {
      id: `h-${Date.now()}`,
      name,
      frequency,
      streak: 0,
      history: [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    setState(prev => ({
      ...prev,
      habits: [...prev.habits, newHabit]
    }));
  };

  const deleteHabit = (id: string) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== id)
    }));
  };

  const toggleHabit = (id: string, dateStr: string) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.map(h => {
        if (h.id === id) {
          const hasCompleted = h.history.includes(dateStr);
          let newHistory = [...h.history];
          let newStreak = h.streak;

          if (hasCompleted) {
            // Uncheck/remove
            newHistory = newHistory.filter(d => d !== dateStr);
            // Simple recaltulate streak
            newStreak = Math.max(0, h.streak - 1);
          } else {
            // Add completion
            newHistory.push(dateStr);
            
            // Check if it is consecutive
            const lastCompletedDate = h.lastCompleted;
            if (lastCompletedDate) {
              const prevDate = new Date(dateStr);
              prevDate.setDate(prevDate.getDate() - 1);
              const prevDateStr = prevDate.toISOString().split('T')[0];
              
              if (lastCompletedDate === prevDateStr) {
                newStreak += 1;
              } else {
                newStreak = 1;
              }
            } else {
              newStreak = 1;
            }
          }

          return {
            ...h,
            history: newHistory,
            streak: newStreak,
            lastCompleted: !hasCompleted ? dateStr : h.lastCompleted
          };
        }
        return h;
      })
    }));
  };

  const updateHabit = (id: string, name: string, frequency: 'diário' | 'semanal') => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.map(h => h.id === id ? { ...h, name, frequency } : h)
    }));
  };

  // Nightly checklist handlers과 habits synchronization helper
  const syncNightlyWithHabit = (nightlyList: NightlyChecklistItem[], habitsList: Habit[]) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const total = nightlyList.length;
    const checked = nightlyList.filter(n => n.checked).length;
    const isCompleted = total > 0 && checked === total;

    // Find if habit "Rotina de Fechamento Noturna" exists
    let targetHabit = habitsList.find(h => h.name.toLowerCase().includes('fechamento') || h.name.toLowerCase().includes('rotina noturna'));
    
    let updatedHabits = [...habitsList];
    if (!targetHabit) {
      if (!isCompleted) return habitsList; // No need to create it if we haven't completed it yet
      // Create the habit
      const newHabit: Habit = {
        id: `h-nightly-${Date.now()}`,
        name: 'Rotina de Fechamento Noturna 🌜',
        frequency: 'diário',
        streak: 1,
        history: [todayStr],
        lastCompleted: todayStr,
        createdAt: new Date().toISOString().split('T')[0]
      };
      updatedHabits.push(newHabit);
    } else {
      // Habit exists, let's update its history
      updatedHabits = habitsList.map(h => {
        if (h.id === targetHabit!.id) {
          const hasToday = h.history.includes(todayStr);
          let newHistory = [...h.history];
          let newStreak = h.streak;
          let newLastCompleted = h.lastCompleted;

          if (isCompleted && !hasToday) {
            newHistory.push(todayStr);
            const prevDateObj = new Date();
            prevDateObj.setDate(prevDateObj.getDate() - 1);
            const prevDateStr = prevDateObj.toISOString().split('T')[0];
            if (h.lastCompleted === prevDateStr) {
              newStreak += 1;
            } else {
              newStreak = 1;
            }
            newLastCompleted = todayStr;
          } else if (!isCompleted && hasToday) {
            newHistory = newHistory.filter(d => d !== todayStr);
            newStreak = Math.max(0, h.streak - 1);
          }

          return {
            ...h,
            history: newHistory,
            streak: newStreak,
            lastCompleted: newLastCompleted
          };
        }
        return h;
      });
    }
    return updatedHabits;
  };

  const toggleNightlyItem = (id: string) => {
    setState(prev => {
      const updatedNightly = prev.nightlyRoutine.map(item => item.id === id ? { ...item, checked: !item.checked } : item);
      const updatedHabits = syncNightlyWithHabit(updatedNightly, prev.habits);
      return {
        ...prev,
        nightlyRoutine: updatedNightly,
        habits: updatedHabits
      };
    });
  };

  const addNightlyItem = (label: string) => {
    setState(prev => ({
      ...prev,
      nightlyRoutine: [...prev.nightlyRoutine, { id: `n-${Date.now()}`, label, checked: false }]
    }));
  };

  const editNightlyItem = (id: string, label: string) => {
    setState(prev => ({
      ...prev,
      nightlyRoutine: prev.nightlyRoutine.map(item => item.id === id ? { ...item, label } : item)
    }));
  };

  const deleteNightlyItem = (id: string) => {
    setState(prev => {
      const updatedNightly = prev.nightlyRoutine.filter(item => item.id !== id);
      const updatedHabits = syncNightlyWithHabit(updatedNightly, prev.habits);
      return {
        ...prev,
        nightlyRoutine: updatedNightly,
        habits: updatedHabits
      };
    });
  };

  const resetNightlyRoutine = () => {
    setState(prev => {
      const updatedNightly = prev.nightlyRoutine.map(item => ({ ...item, checked: false }));
      const updatedHabits = syncNightlyWithHabit(updatedNightly, prev.habits);
      return {
        ...prev,
        nightlyRoutine: updatedNightly,
        habits: updatedHabits
      };
    });
  };

  // Weekly energy
  const setWeeklyEnergy = (energy: WeeklyEnergy) => {
    setState(prev => ({
      ...prev,
      weeklyEnergy: energy,
      energySetDate: new Date().toISOString().split('T')[0]
    }));
  };

  // Sazonalidade (Annual tasks)
  const toggleSeasonalTask = (id: string, year: number) => {
    setState(prev => ({
      ...prev,
      seasonalTasks: prev.seasonalTasks.map(task => {
        if (task.id === id) {
          const completed = task.completedYears.includes(year);
          return {
            ...task,
            completedYears: completed 
              ? task.completedYears.filter(y => y !== year) 
              : [...task.completedYears, year]
          };
        }
        return task;
      })
    }));
  };

  const addSeasonalTask = (title: string, month: number, description: string) => {
    const newTask: SeasonalTask = {
      id: `st-${Date.now()}`,
      title,
      month,
      description,
      completedYears: []
    };
    setState(prev => ({
      ...prev,
      seasonalTasks: [...prev.seasonalTasks, newTask]
    }));
  };

  const deleteSeasonalTask = (id: string) => {
    setState(prev => ({
      ...prev,
      seasonalTasks: prev.seasonalTasks.filter(item => item.id !== id)
    }));
  };

  const editSeasonalTask = (id: string, title: string, month: number, description: string) => {
    setState(prev => ({
      ...prev,
      seasonalTasks: prev.seasonalTasks.map(task => task.id === id ? { ...task, title, month, description } : task)
    }));
  };

  // Module 6: Index of Order Quiz
  const submitQuizAnswers = (answers: { [questionId: string]: boolean }) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const totalQuestions = state.quizQuestions.length;
    const correctCount = Object.values(answers).filter(v => v === true).length;
    
    // index is basically percentage of safe affirmative answers
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;

    const newEntry: QuizHistoryEntry = {
      id: `qh-${Date.now()}`,
      date: todayStr,
      score,
      answers
    };

    setState(prev => {
      // Overwrite if took puzzle multiple times today
      const baseHistory = prev.quizHistory.filter(h => h.date !== todayStr);
      const isCrisis = score < 50;

      return {
        ...prev,
        quizHistory: [...baseHistory, newEntry],
        // Auto trigger crisis mode if score is low
        crisisMode: isCrisis ? true : prev.crisisMode
      };
    });
  };

  const setCrisisMode = (crisis: boolean) => {
    setState(prev => ({
      ...prev,
      crisisMode: crisis
    }));
  };

  const addQuizQuestion = (question: string) => {
    const newQ: QuizQuestion = {
      id: `q-${Date.now()}`,
      question
    };
    setState(prev => ({
      ...prev,
      quizQuestions: [...prev.quizQuestions, newQ]
    }));
  };

  const editQuizQuestion = (id: string, question: string) => {
    setState(prev => ({
      ...prev,
      quizQuestions: prev.quizQuestions.map(q => q.id === id ? { ...q, question } : q)
    }));
  };

  const deleteQuizQuestion = (id: string) => {
    setState(prev => ({
      ...prev,
      quizQuestions: prev.quizQuestions.filter(q => q.id !== id)
    }));
  };

  // Module 7: Critical Memory
  // Critical emergency contacts & items
  const addCriticalContact = (title: string, value: string, category: CriticalContact['category']) => {
    setState(prev => ({
      ...prev,
      criticalContacts: [...prev.criticalContacts, { id: `cc-${Date.now()}`, title, value, category }]
    }));
  };

  const editCriticalContact = (id: string, title: string, value: string, category: CriticalContact['category']) => {
    setState(prev => ({
      ...prev,
      criticalContacts: prev.criticalContacts.map(cc => cc.id === id ? { ...cc, title, value, category } : cc)
    }));
  };

  const deleteCriticalContact = (id: string) => {
    setState(prev => ({
      ...prev,
      criticalContacts: prev.criticalContacts.filter(cc => cc.id !== id)
    }));
  };

  // Object tracker
  const addLostObject = (name: string, lastSeenLocation: string) => {
    setState(prev => ({
      ...prev,
      lostObjects: [...prev.lostObjects, { id: `lo-${Date.now()}`, name, lastSeenLocation, updatedAt: new Date().toISOString() }]
    }));
  };

  const editLostObject = (id: string, name: string, lastSeenLocation: string) => {
    setState(prev => ({
      ...prev,
      lostObjects: prev.lostObjects.map(lo => lo.id === id ? { ...lo, name, lastSeenLocation, updatedAt: new Date().toISOString() } : lo)
    }));
  };

  const deleteLostObject = (id: string) => {
    setState(prev => ({
      ...prev,
      lostObjects: prev.lostObjects.filter(lo => lo.id !== id)
    }));
  };

  // Favors tracker (Borrowed objects)
  const addBorrowedItem = (name: string, personName: string, type: BorrowedItem['type'], date: string) => {
    setState(prev => ({
      ...prev,
      borrowedItems: [...prev.borrowedItems, { id: `bi-${Date.now()}`, name, personName, date, type, returned: false }]
    }));
  };

  const toggleBorrowedItemReturned = (id: string) => {
    setState(prev => ({
      ...prev,
      borrowedItems: prev.borrowedItems.map(bi => {
        if (bi.id === id) {
          const isReturning = !bi.returned;
          return {
            ...bi,
            returned: isReturning,
            returnedDate: isReturning ? new Date().toISOString().split('T')[0] : undefined
          };
        }
        return bi;
      })
    }));
  };

  const editBorrowedItem = (id: string, name: string, personName: string, type: BorrowedItem['type'], date: string) => {
    setState(prev => ({
      ...prev,
      borrowedItems: prev.borrowedItems.map(bi => bi.id === id ? { ...bi, name, personName, type, date } : bi)
    }));
  };

  const deleteBorrowedItem = (id: string) => {
    setState(prev => ({
      ...prev,
      borrowedItems: prev.borrowedItems.filter(bi => bi.id !== id)
    }));
  };

  // Mission delegation
  const addMission = (mission: Omit<DelegationMission, 'id' | 'createdAt'>) => {
    setState(prev => ({
      ...prev,
      missions: [...prev.missions, { ...mission, id: `m-${Date.now()}`, createdAt: new Date().toISOString() }]
    }));
  };

  const deleteMission = (id: string) => {
    setState(prev => ({
      ...prev,
      missions: prev.missions.filter(m => m.id !== id)
    }));
  };

  const toggleMissionTask = (missionId: string, taskId: string) => {
    setState(prev => ({
      ...prev,
      missions: prev.missions.map(m => {
        if (m.id === missionId) {
          return {
            ...m,
            tasks: m.tasks.map(t => t.id === taskId ? { ...t, checked: !t.checked } : t)
          };
        }
        return m;
      })
    }));
  };

  const editMission = (id: string, updatedFields: Partial<DelegationMission>) => {
    setState(prev => ({
      ...prev,
      missions: prev.missions.map(m => m.id === id ? { ...m, ...updatedFields } : m)
    }));
  };

  // M8 Functions
  const addMemory = (title: string, description: string, photoUrl: string, date: string, photoUrls?: string[]) => {
    setState(prev => ({
      ...prev,
      affectiveMemories: [...prev.affectiveMemories, { 
        id: `mem-${Date.now()}`, 
        title, 
        description, 
        photoUrl: photoUrl || (photoUrls && photoUrls[0]) || '', 
        photoUrls: photoUrls || (photoUrl ? [photoUrl] : []),
        date 
      }]
    }));
  };

  const deleteMemory = (id: string) => {
    setState(prev => ({
      ...prev,
      affectiveMemories: prev.affectiveMemories.filter(m => m.id !== id)
    }));
  };

  const addTimeCapsule = (title: string, message: string, unlockDate: string) => {
    setState(prev => ({
      ...prev,
      timeCapsules: [...prev.timeCapsules, { id: `cap-${Date.now()}`, title, message, unlockDate, createdAt: new Date().toISOString() }]
    }));
  };

  const deleteTimeCapsule = (id: string) => {
    setState(prev => ({
      ...prev,
      timeCapsules: prev.timeCapsules.filter(c => c.id !== id)
    }));
  };

  const addSavedTheme = (name: string, primary: string, secondary: string, accent: string, backgroundLight: string) => {
    const newTheme: CustomTheme = {
      id: `theme-${Date.now()}`,
      name,
      primary,
      secondary,
      accent,
      backgroundLight
    };
    setState(prev => ({
      ...prev,
      savedThemes: [...(prev.savedThemes || []), newTheme]
    }));
  };

  const deleteSavedTheme = (id: string) => {
    setState(prev => ({
      ...prev,
      savedThemes: (prev.savedThemes || []).filter(t => t.id !== id)
    }));
  };

  // Module 9: Pet Functions
  const updateCatProfile = (id: string, name: string, photoUrl: string) => {
    setState(prev => ({
      ...prev,
      cats: (prev.cats || []).map(c => c.id === id ? { ...c, name, photoUrl } : c)
    }));
  };

  const addCatVaccine = (catId: string, name: string, appliedDate: string, nextDoseDate: string) => {
    setState(prev => ({
      ...prev,
      cats: (prev.cats || []).map(c => {
        if (c.id === catId) {
          const newVac = { id: `vac-${Date.now()}`, name, appliedDate, nextDoseDate };
          return { ...c, vaccines: [...c.vaccines, newVac] };
        }
        return c;
      })
    }));
  };

  const deleteCatVaccine = (catId: string, vaccineId: string) => {
    setState(prev => ({
      ...prev,
      cats: (prev.cats || []).map(c => {
        if (c.id === catId) {
          return { ...c, vaccines: c.vaccines.filter(v => v.id !== vaccineId) };
        }
        return c;
      })
    }));
  };

  const addCatVetRecord = (catId: string, date: string, weight: number, reason: string, cost?: number) => {
    setState(prev => ({
      ...prev,
      cats: (prev.cats || []).map(c => {
        if (c.id === catId) {
          const newRec = { id: `vet-${Date.now()}`, date, weight, reason, cost };
          return { ...c, vetRecords: [newRec, ...c.vetRecords] };
        }
        return c;
      })
    }));
  };

  const deleteCatVetRecord = (catId: string, recordId: string) => {
    setState(prev => ({
      ...prev,
      cats: (prev.cats || []).map(c => {
        if (c.id === catId) {
          return { ...c, vetRecords: c.vetRecords.filter(r => r.id !== recordId) };
        }
        return c;
      })
    }));
  };

  const addPetSupply = (type: 'ração' | 'areia', brand: string, quantity: string, openedDate: string) => {
    setState(prev => ({
      ...prev,
      petSupplies: [
        ...(prev.petSupplies || []),
        { id: `sup-${Date.now()}`, type, brand, quantity, openedDate, finished: false }
      ]
    }));
  };

  const finishPetSupply = (id: string, finishedDate: string) => {
    setState(prev => ({
      ...prev,
      petSupplies: (prev.petSupplies || []).map(s => s.id === id ? { ...s, finishedDate, finished: true } : s)
    }));
  };

  const deletePetSupply = (id: string) => {
    setState(prev => ({
      ...prev,
      petSupplies: (prev.petSupplies || []).filter(s => s.id !== id)
    }));
  };

  return {
    state,
    theme: state.theme,
    colors: state.colors,
    userProfile: state.userProfile,
    
    // Core settings
    toggleTheme,
    updateColors,
    resetColors,
    updateProfile,

    // Pet module functions
    updateCatProfile,
    addCatVaccine,
    deleteCatVaccine,
    addCatVetRecord,
    deleteCatVetRecord,
    addPetSupply,
    finishPetSupply,
    deletePetSupply,

    // M1 Functions
    addTask,
    updateTask,
    toggleTask,
    deleteTask,

    // M2 Functions
    addPurchaseItem,
    updatePurchaseItem,
    togglePurchaseItem,
    deletePurchaseItem,
    archiveCurrentList,
    duplicateMonthList,
    updateCorridorOrder,

    // M3 Functions
    addPantryItem,
    updatePantryItem,
    deletePantryItem,
    sendItemsBelowMinToShoppingList,

    // M4 Functions
    addRoom,
    updateRoom,
    deleteRoom,
    addRoomChecklistItem,
    toggleRoomChecklistItem,
    deleteRoomChecklistItem,
    addRoomPhoto,
    deleteRoomPhoto,
    addRoomMaintenance,
    deleteRoomMaintenance,
    addRoomObject,
    removeRoomObject,

    // M5 Functions
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    addNightlyItem,
    editNightlyItem,
    deleteNightlyItem,
    toggleNightlyItem,
    resetNightlyRoutine,
    setWeeklyEnergy,
    toggleSeasonalTask,
    addSeasonalTask,
    editSeasonalTask,
    deleteSeasonalTask,

    // M6 Functions
    submitQuizAnswers,
    setCrisisMode,
    addQuizQuestion,
    editQuizQuestion,
    deleteQuizQuestion,

    // M7 Functions
    addCriticalContact,
    editCriticalContact,
    deleteCriticalContact,
    addLostObject,
    editLostObject,
    deleteLostObject,
    addBorrowedItem,
    toggleBorrowedItemReturned,
    editBorrowedItem,
    deleteBorrowedItem,
    addMission,
    deleteMission,
    toggleMissionTask,
    editMission,

    // M8 Functions
    addMemory,
    deleteMemory,
    addTimeCapsule,
    deleteTimeCapsule,
    addSavedTheme,
    deleteSavedTheme
  };
}
