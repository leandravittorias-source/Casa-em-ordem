/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Shared Categories & Priorities
export type Priority = 'alta' | 'média' | 'baixa';

export type TaskCategory = 'trabalho' | 'casa' | 'pessoal' | 'saúde' | 'outros';

export type PurchaseCategory = 'hortifruti' | 'limpeza' | 'higiene' | 'frios' | 'mercearia' | 'bebidas' | 'outros';

// Module 1: To-Do Tasks
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: TaskCategory;
  dueDate: string; // ISO Date YYYY-MM-DD
  completed: boolean;
  completedAt?: string; // ISO Timestamp
  createdAt: string; // ISO Timestamp
  recurrence?: 'none' | 'diaria' | 'semanal' | 'mensal' | 'trimestral' | 'anual';
}

// Module 2: Shopping List Items
export interface PurchaseItem {
  id: string;
  name: string;
  category: PurchaseCategory;
  quantity: number;
  unitPrice: number;
  purchased: boolean;
  purchasedAt?: string;
}

export interface PurchaseHistoryMonth {
  id: string; // e.g. "2026-05"
  monthLabel: string; // e.g. "Maio/2026"
  items: PurchaseItem[];
  totalGasto: number;
}

// Module 3: Pantry (Despensa) Items
export interface PantryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  rating?: number; // 1-5
  review?: string;
  buyAgain?: 'sim' | 'não' | 'talvez';
}

// Module 4: Home Map & Rooms
export interface RoomPhoto {
  id: string;
  photoUrl: string; // base64 string
  note: string;
  date: string; // YYYY-MM-DD
}

export interface MaintenanceHistory {
  id: string;
  date: string;
  description: string;
  cost: number;
}

export interface RoomChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface Room {
  id: string;
  name: string;
  color: string; // hex
  iconName: string; // lucide icon identifier
  criticalInfo: string; // password, technical, etc.
  checklist: RoomChecklistItem[];
  photos: RoomPhoto[];
  maintenance: MaintenanceHistory[];
  objects: string[]; // List of registered objects in this room
}

// Module 5: Habits & Routines
export interface Habit {
  id: string;
  name: string;
  frequency: 'diário' | 'semanal';
  streak: number;
  lastCompleted?: string; // YYYY-MM-DD
  history: string[]; // Array of YYYY-MM-DD dates completed
  createdAt: string;
}

export interface NightlyChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

// Energy Level Setup
export type WeeklyEnergy = 'alta' | 'média' | 'baixa';

export interface SeasonalTask {
  id: string;
  title: string;
  month: number; // 0-11
  description: string;
  completedYears: number[]; // e.g. [2025, 2026]
}

// Module 6: Order Index
export interface QuizQuestion {
  id: string;
  question: string;
}

export interface QuizHistoryEntry {
  id: string; // YYYY-MM-DD
  date: string;
  score: number; // 0 - 100
  answers: { [questionId: string]: boolean };
}

// Module 7: Critical Memory & Vault
export interface CriticalContact {
  id: string;
  title: string; // e.g. "Seguradora", "Disjuntor"
  value: string; // e.g. "Porto Seguro: 0800-x", "No corredor principal"
  category: 'emergência' | 'localização' | 'financeiro' | 'outros';
}

export interface LostObject {
  id: string;
  name: string;
  lastSeenLocation: string; // e.g. "Gaveta da cozinha"
  updatedAt: string;
}

export interface BorrowedItem {
  id: string;
  name: string; // what was borrowed/lent
  personName: string;
  date: string; // YYYY-MM-DD
  type: 'emprestado_para' | 'pego_emprestado_de';
  returned: boolean;
  returnedDate?: string;
}

export interface MissionTask {
  id: string;
  label: string;
  checked: boolean;
}

export interface DelegationMission {
  id: string;
  title: string; // e.g. "Missão Faxina de Quinta"
  recipient: string; // e.g. "Clara"
  instructions: string;
  suppliesNeeded: string; // e.g. "Detergente, pano microfibra"
  locationOfSupplies: string; // e.g. "Armário embaixo da pia"
  tasks: MissionTask[];
  createdAt: string;
}

// Module 8: Affective Memories
export interface AffectiveMemory {
  id: string;
  title: string;
  description: string;
  photoUrl: string; // base64 string
  photoUrls?: string[]; // Array of base64 strings for carousel!
  date: string; // YYYY-MM-DD
}

export interface TimeCapsule {
  id: string;
  title: string;
  message: string;
  unlockDate: string; // YYYY-MM-DD
  createdAt: string; // ISO Date
}

// Module 9: Espaço Pet (Minhas Gatas)
export interface VaccineRecord {
  id: string;
  name: string;
  appliedDate: string;
  nextDoseDate: string;
}

export interface VetRecord {
  id: string;
  date: string;
  weight: number; // in kg
  reason: string;
  cost?: number;
}

export interface CatProfile {
  id: string;
  name: string;
  photoUrl: string; // base64 representation of self photo
  vaccines: VaccineRecord[];
  vetRecords: VetRecord[];
}

export interface SupplyPackage {
  id: string;
  type: 'ração' | 'areia';
  brand: string;
  quantity: string; // e.g., "7kg", "10kg", "4kg"
  openedDate: string; // YYYY-MM-DD
  finishedDate?: string; // YYYY-MM-DD
  finished: boolean;
}

// Config & Theme Styles
export interface AppThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  backgroundLight: string;
  backgroundDark: string;
  cardLight: string;
  cardDark: string;
}

export interface CustomTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  backgroundLight: string;
}

export interface UserProfile {
  name: string;
  avatarUrl?: string; // base64 representation of self photo
}

export interface AppState {
  tasks: Task[];
  purchases: PurchaseItem[];
  purchaseHistory: PurchaseHistoryMonth[];
  currentPurchaseMonth: string; // "YYYY-MM"
  purchaseCorridorOrder: string[]; // Purchase category order
  purchasePriceRadar: { [itemName: string]: number[] }; // tracks prices paid per item name
  pantry: PantryItem[];
  rooms: Room[];
  habits: Habit[];
  nightlyRoutine: NightlyChecklistItem[];
  weeklyEnergy: WeeklyEnergy;
  energySetDate?: string; // YYYY-MM-DD when weeklyEnergy was set
  seasonalTasks: SeasonalTask[];
  quizQuestions: QuizQuestion[];
  quizHistory: QuizHistoryEntry[];
  crisisMode: boolean;
  criticalContacts: CriticalContact[];
  lostObjects: LostObject[];
  borrowedItems: BorrowedItem[];
  missions: DelegationMission[];
  affectiveMemories: AffectiveMemory[];
  timeCapsules: TimeCapsule[];
  userProfile: UserProfile;
  theme: 'claro' | 'escuro';
  colors: AppThemeColors;
  savedThemes?: CustomTheme[];
  cats?: CatProfile[];
  petSupplies?: SupplyPackage[];
}
