/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAppState } from './hooks/useAppState';
import { 
  Home, CheckSquare, ShoppingCart, Archive, MapPin, 
  Calendar, Zap, BarChart2, ShieldAlert, Heart, Menu, X, User,
  Cat, Droplet, Power, Phone, Compass, AlertTriangle, ChevronRight
} from 'lucide-react';

// Modular view imports
import DashboardView from './components/DashboardView';
import TodoView from './components/TodoView';
import ShoppingView from './components/ShoppingView';
import PantryView from './components/PantryView';
import HomeMapView from './components/HomeMapView';
import HabitsView from './components/HabitsView';
import OrderIndexView from './components/OrderIndexView';
import CriticalMemoryView from './components/CriticalMemoryView';
import AestheticMemoriesView from './components/AestheticMemoriesView';
import PetSpaceView from './components/PetSpaceView';

export default function App() {
  const {
    state,
    updateProfile,
    updateColors,
    // M1
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    // M2
    addPurchaseItem,
    updatePurchaseItem,
    togglePurchaseItem,
    deletePurchaseItem,
    archiveCurrentList,
    duplicateMonthList,
    updateCorridorOrder,
    // M3
    addPantryItem,
    updatePantryItem,
    deletePantryItem,
    sendItemsBelowMinToShoppingList,
    // M4
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
    // M5
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
    // M6
    submitQuizAnswers,
    setCrisisMode,
    addQuizQuestion,
    editQuizQuestion,
    deleteQuizQuestion,
    // M7
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
    // M8
    addMemory,
    deleteMemory,
    addTimeCapsule,
    deleteTimeCapsule,
    addSavedTheme,
    deleteSavedTheme,
    // M9: Pets
    updateCatProfile,
    addCatVaccine,
    deleteCatVaccine,
    addCatVetRecord,
    deleteCatVetRecord,
    addPetSupply,
    finishPetSupply,
    deletePetSupply
  } = useAppState();

  // Navigation state (Active module index 0 to 9)
  const [activeModule, setActiveModule] = useState<number>(0);

  // Shared Market Mode tracking
  const [isMercadoMode, setIsMercadoMode] = useState(false);
  
  // Mobile drawer panel toggle state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Emergency Panel toggle state
  const [showEmergencyPanel, setShowEmergencyPanel] = useState(false);

  // Apply customized colors dynamically on load/update with precise glass opacity conversions
  useEffect(() => {
    const palette = state.colors;
    
    // Hex to RGBA utility which extracts glass colors
    const hexToRgba = (hex: string, alpha: number) => {
      if (!hex) return `rgba(255, 255, 255, ${alpha})`;
      let c = hex.substring(1);
      if (c.length === 3) {
        c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
      }
      const r = parseInt(c.substring(0, 2), 16);
      const g = parseInt(c.substring(2, 4), 16);
      const b = parseInt(c.substring(4, 6), 16);
      return `rgba(${isNaN(r) ? 255 : r}, ${isNaN(g) ? 255 : g}, ${isNaN(b) ? 255 : b}, ${alpha})`;
    };

    const bgLight = palette.backgroundLight || '#f8fafc';
    const cardColor = hexToRgba(palette.accent || '#ffffff', 0.65); // CARD/BLOCOS
    const navColor = hexToRgba(palette.secondary || '#ffffff', 0.55); // NAV/SIDEBAR/TOPBAR
    const textColor = palette.primary || '#1e1b4b'; // TEXTO E TITULOS

    document.documentElement.style.setProperty('--theme-background', bgLight);
    document.documentElement.style.setProperty('--theme-card', cardColor);
    document.documentElement.style.setProperty('--theme-navbar', navColor);
    document.documentElement.style.setProperty('--theme-text', textColor);
    document.documentElement.style.setProperty('--theme-accent', textColor);
  }, [state.colors]);

  // Handle Crisis Mode Overrides redirecting to Module 6 where crisis pane is hosted!
  useEffect(() => {
    if (state.crisisMode) {
      setActiveModule(6); // Redirects to OrderIndexView where Crisis mode card is active
    }
  }, [state.crisisMode]);

  const modules = [
    { id: 0, title: 'Painel Geral', icon: Home, count: null },
    { id: 1, title: 'Tarefas (To-Do)', icon: CheckSquare, count: state.tasks.filter(t => !t.completed).length },
    { id: 2, title: 'Lista de Compras', icon: ShoppingCart, count: state.purchases.filter(s => !s.purchased).length },
    { id: 3, title: 'Despensa & Lab', icon: Archive, count: state.pantry.filter(i => i.quantity <= i.minQuantity).length },
    { id: 4, title: 'Mapa da Casa', icon: MapPin, count: state.rooms.length },
    { id: 9, title: 'Minhas Gatas 🐾', icon: Cat, count: null },
    { id: 5, title: 'Hábitos e Rotinas', icon: Calendar, count: state.habits.length },
    { id: 6, title: 'Índice de Ordem', icon: BarChart2, count: state.crisisMode ? '!' : null },
    { id: 7, title: 'Cofre e Segurança', icon: ShieldAlert, count: state.criticalContacts.length },
    { id: 8, title: 'Memórias & Ajustes', icon: Heart, count: state.affectiveMemories.length }
  ];

  const handleNav = (id: number) => {
    setActiveModule(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-transparent transition-colors flex flex-col md:flex-row font-sans">
      
      {/* 1. LATERAL SIDEBAR FOR DESKTOP (Width > 768px) */}
      <aside 
        className="hidden md:flex md:flex-col justify-between w-64 shrink-0 p-5 text-slate-700 bg-white/70 backdrop-blur-xl border border-white/50 transition-all shadow-xl shadow-indigo-100/30 m-4 rounded-[2rem]"
      >
        <div className="space-y-6">
          {/* Brand header */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200/50 select-none">
            <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-2xl shadow-inner">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-sans font-black text-sm tracking-tight leading-none text-slate-800">Casa em Ordem</h1>
              <span className="text-[9px] text-indigo-400 font-mono font-bold uppercase tracking-wider block mt-1">ORGANIZADOR FEMININO</span>
            </div>
          </div>

          {/* User profile capsule card */}
          <div className="p-3 bg-white/50 hover:bg-white/80 transition-all rounded-xl flex items-center justify-between gap-2 border border-white/40">
            <div className="flex items-center gap-2.5 truncate">
              {state.userProfile.avatarUrl ? (
                <img 
                  src={state.userProfile.avatarUrl} 
                  alt="Perfil" 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 object-cover rounded-full border border-indigo-205 pointer-events-none" 
                />
              ) : (
                <div className="w-8 h-8 bg-indigo-50 flex items-center justify-center rounded-full text-indigo-550 border border-slate-100 shrink-0">
                  <User className="w-4 h-4 text-indigo-455" />
                </div>
              )}
              <div className="truncate">
                <span className="text-[8px] text-[#818cf8] font-mono font-bold block">MORADORA</span>
                <span className="font-extrabold text-xs capitalize text-slate-800 truncate block">{state.userProfile.name}</span>
              </div>
            </div>
            <button 
              onClick={() => setShowEmergencyPanel(true)}
              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-transform hover:scale-105 shrink-0 cursor-pointer"
              title="Acesso Rápido de Emergência Residencial 🚨"
            >
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
            </button>
          </div>

          {/* Navigation modules links */}
          <nav className="space-y-2">
            {modules.map(mod => {
              const Icon = mod.icon;
              const isActive = activeModule === mod.id;

              return (
                <button
                  key={mod.id}
                  onClick={() => handleNav(mod.id)}
                  className={`w-full py-2.5 px-4 rounded-2xl text-left text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer border-l-4 ${
                    isActive 
                      ? 'bg-[#6366f1]/10 text-indigo-950 border-[#6366f1] shadow-sm font-black scale-[1.02]' 
                      : 'hover:bg-white/50 border-transparent text-slate-600 hover:text-indigo-950'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#6366f1]' : 'text-slate-400'}`} />
                    <span className={isActive ? 'text-indigo-950 font-black' : ''}>{mod.title}</span>
                  </div>

                  {mod.count !== null && mod.count > 0 && (
                    <span className={`text-[9px] font-mono font-extrabold p-0.5 px-1.5 rounded-full ${
                      isActive 
                        ? 'bg-rose-500 text-white shadow-xs' 
                        : 'bg-indigo-50 text-indigo-500'
                    }`}>
                      {mod.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="pt-4 border-t border-slate-200/50 text-center select-none text-[9px] text-slate-400 font-mono font-semibold">
          <p>© Casa em Ordem</p>
          <p>Local Safe Storage 🌸</p>
        </div>
      </aside>

      {/* 2. DYNAMIC MOBILE HEADER BAR AND SLIDEOUT DRAWER */}
      {!(activeModule === 2 && isMercadoMode) && (
        <header 
          className="md:hidden flex justify-between items-center p-4 text-slate-00 bg-white/70 backdrop-blur-md border border-white/60 shadow-sm z-40 shrink-0 select-none m-3 rounded-2xl"
        >
          <div className="flex items-center gap-2">
            <div className="p-1 px-2 bg-indigo-50 text-indigo-500 rounded-lg">
              <span className="text-sm">🌸</span>
            </div>
            <span className="font-sans font-black text-md tracking-tight text-slate-800">Casa em Ordem</span>
          </div>
   
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowEmergencyPanel(true)}
              className="p-2 bg-rose-50 text-rose-600 rounded-xl transition cursor-pointer"
              title="Acesso de Emergência 🚨"
            >
              <ShieldAlert className="w-4 h-4 animate-pulse" />
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-indigo-50/50 hover:bg-indigo-100/55 rounded-xl transition cursor-pointer text-indigo-600"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </header>
      )}
 
      {/* Mobile Drawer panel popup overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-30 transition-opacity" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="w-64 max-w-[80vw] h-full p-5 flex flex-col justify-between text-slate-700 bg-white/95 backdrop-blur-xl border-r border-white/50 transition-all shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                <span className="text-lg">✨</span>
                <h1 className="font-bold text-sm uppercase tracking-wider text-indigo-950">Módulos da Casa</h1>
              </div>
 
              <div className="flex items-center gap-2.5 p-2 bg-indigo-50/60 rounded-xl border border-indigo-100/40">
                {state.userProfile.avatarUrl ? (
                  <img src={state.userProfile.avatarUrl} alt="Perfil" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover border border-pink-200" />
                ) : (
                  <div className="w-8 h-8 bg-indigo-100/70 rounded-full flex items-center justify-center text-indigo-600 font-bold">🌸</div>
                )}
                <span className="font-extrabold text-xs tracking-tight text-slate-800">{state.userProfile.name}</span>
              </div>
 
              <nav className="space-y-1">
                {modules.map(mod => {
                  const Icon = mod.icon;
                  const isActive = activeModule === mod.id;
 
                  return (
                    <button
                      key={mod.id}
                      onClick={() => handleNav(mod.id)}
                      className={`w-full py-2.5 px-3 rounded-xl text-left text-[11px] font-extrabold uppercase tracking-widest flex items-center justify-between transition cursor-pointer ${
                        isActive 
                          ? 'bg-[#6366f1]/10 text-[#6366f1] font-black border-l-4 border-[#6366f1] pl-2' 
                          : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{mod.title}</span>
                      </div>
                      {mod.count !== null && mod.count > 0 && (
                        <span className="text-[9px] bg-rose-500 text-white font-mono font-bold px-1.5 rounded-full">{mod.count}</span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
 
            <div className="text-[9px] text-center opacity-75 font-mono pt-4 border-t border-slate-100">
              <p>🌸 Casa em Ordem • Estilo Pastel</p>
            </div>
          </div>
        </div>
      )}
 
      {/* 3. CENTRAL WORKSPACE COMPONENT WORKER VIEWPORT */}
      <main className={`flex-1 overflow-y-auto max-w-7xl mx-auto w-full transition-all ${
        (activeModule === 2 && isMercadoMode) 
          ? 'p-2 pt-2 md:p-6 lg:p-8 pb-4' 
          : 'p-4 sm:p-6 lg:p-8 pb-20 md:pb-8'
      }`}>
        
        {/* Dynamic header summary statistics when in regular mode */}
        {!state.crisisMode && !(activeModule === 2 && isMercadoMode) && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/70 backdrop-blur-md border-2 border-white/60 p-5 rounded-3xl mb-8 shadow-xs gap-4 text-slate-800">
            <div className="flex items-center gap-4">
              {state.userProfile.avatarUrl ? (
                <img src={state.userProfile.avatarUrl} alt="Moradora" referrerPolicy="no-referrer" className="w-12 h-12 object-cover rounded-full border-2 border-[#818cf8] shadow-md shadow-indigo-500/10" />
              ) : (
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 font-bold text-lg shadow-md">🌸</div>
              )}
              <div>
                <h3 className="font-sans font-black text-lg text-indigo-950 leading-tight">Olá, {state.userProfile.name}! 👋</h3>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6366f1]">Nível Pro • Tudo Sob Controle</span>
              </div>
            </div>
 
            <div className="flex items-center gap-4 text-right self-stretch sm:self-auto justify-between sm:justify-end">
              <div>
                <span className="text-[10px] block text-slate-400 font-bold uppercase font-mono tracking-wider leading-none mb-1.5">Carga de Trabalho</span>
                <span className="text-xs font-bold bg-[#6366f1]/10 text-[#6366f1] py-1.5 px-4 rounded-full border border-[#6366f1]/25 font-mono">
                  {state.tasks.filter(t => !t.completed).length} Afazeres
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic rendering selector */}
        {activeModule === 0 && (
          <DashboardView 
            state={state} 
            onNavigate={setActiveModule} 
          />
        )}

        {activeModule === 1 && (
          <TodoView
            tasks={state.tasks}
            addTask={addTask}
            updateTask={updateTask}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
          />
        )}

        {activeModule === 2 && (
          <ShoppingView
            purchases={state.purchases}
            purchaseHistory={state.purchaseHistory}
            currentPurchaseMonth={state.currentPurchaseMonth}
            purchaseCorridorOrder={state.purchaseCorridorOrder}
            purchasePriceRadar={state.purchasePriceRadar}
            addPurchaseItem={addPurchaseItem}
            updatePurchaseItem={updatePurchaseItem}
            togglePurchaseItem={togglePurchaseItem}
            deletePurchaseItem={deletePurchaseItem}
            archiveCurrentList={archiveCurrentList}
            duplicateMonthList={duplicateMonthList}
            updateCorridorOrder={updateCorridorOrder}
            isMercadoMode={isMercadoMode}
            setIsMercadoMode={setIsMercadoMode}
          />
        )}

        {activeModule === 3 && (
          <PantryView
            pantry={state.pantry}
            addPantryItem={addPantryItem}
            updatePantryItem={updatePantryItem}
            deletePantryItem={deletePantryItem}
            sendItemsBelowMinToShoppingList={sendItemsBelowMinToShoppingList}
          />
        )}

        {activeModule === 4 && (
          <HomeMapView
            rooms={state.rooms}
            addRoom={addRoom}
            updateRoom={updateRoom}
            deleteRoom={deleteRoom}
            addRoomChecklistItem={addRoomChecklistItem}
            toggleRoomChecklistItem={toggleRoomChecklistItem}
            deleteRoomChecklistItem={deleteRoomChecklistItem}
            addRoomPhoto={addRoomPhoto}
            deleteRoomPhoto={deleteRoomPhoto}
            addRoomMaintenance={addRoomMaintenance}
            deleteRoomMaintenance={deleteRoomMaintenance}
            addRoomObject={addRoomObject}
            removeRoomObject={removeRoomObject}
          />
        )}

        {activeModule === 5 && (
          <HabitsView
            habits={state.habits}
            nightlyRoutine={state.nightlyRoutine}
            weeklyEnergy={state.weeklyEnergy}
            energySetDate={state.energySetDate}
            seasonalTasks={state.seasonalTasks}
            addHabit={addHabit}
            updateHabit={updateHabit}
            deleteHabit={deleteHabit}
            toggleHabit={toggleHabit}
            addNightlyItem={addNightlyItem}
            editNightlyItem={editNightlyItem}
            deleteNightlyItem={deleteNightlyItem}
            toggleNightlyItem={toggleNightlyItem}
            resetNightlyRoutine={resetNightlyRoutine}
            setWeeklyEnergy={setWeeklyEnergy}
            toggleSeasonalTask={toggleSeasonalTask}
            addSeasonalTask={addSeasonalTask}
            editSeasonalTask={editSeasonalTask}
            deleteSeasonalTask={deleteSeasonalTask}
          />
        )}

        {activeModule === 6 && (
          <OrderIndexView
            state={state}
            submitQuizAnswers={submitQuizAnswers}
            setCrisisMode={setCrisisMode}
            addQuizQuestion={addQuizQuestion}
            editQuizQuestion={editQuizQuestion}
            deleteQuizQuestion={deleteQuizQuestion}
          />
        )}

        {activeModule === 7 && (
          <CriticalMemoryView
            state={state}
            addCriticalContact={addCriticalContact}
            editCriticalContact={editCriticalContact}
            deleteCriticalContact={deleteCriticalContact}
            addLostObject={addLostObject}
            editLostObject={editLostObject}
            deleteLostObject={deleteLostObject}
            addBorrowedItem={addBorrowedItem}
            toggleBorrowedItemReturned={toggleBorrowedItemReturned}
            editBorrowedItem={editBorrowedItem}
            deleteBorrowedItem={deleteBorrowedItem}
            addMission={addMission}
            deleteMission={deleteMission}
            toggleMissionTask={toggleMissionTask}
            editMission={editMission}
          />
        )}

        {activeModule === 8 && (
          <AestheticMemoriesView
            state={state}
            addMemory={addMemory}
            deleteMemory={deleteMemory}
            addTimeCapsule={addTimeCapsule}
            deleteTimeCapsule={deleteTimeCapsule}
            updateProfile={(prof) => updateProfile(prof.name || '', prof.avatarUrl)}
            updateColors={updateColors}
            addSavedTheme={addSavedTheme}
            deleteSavedTheme={deleteSavedTheme}
          />
        )}

        {activeModule === 9 && (
          <PetSpaceView
            state={state}
            updateCatProfile={updateCatProfile}
            addCatVaccine={addCatVaccine}
            deleteCatVaccine={deleteCatVaccine}
            addCatVetRecord={addCatVetRecord}
            deleteCatVetRecord={deleteCatVetRecord}
            addPetSupply={addPetSupply}
            finishPetSupply={finishPetSupply}
            deletePetSupply={deletePetSupply}
            addPurchaseItem={(name, category, qty, price, brand) => {
              const fullItemName = brand ? `${name} (${brand})` : name;
              addPurchaseItem({
                name: fullItemName,
                category: 'outros',
                quantity: qty,
                unitPrice: price
              });
            }}
          />
        )}

      </main>

      {/* 4. REDUCED BOTTOM MOBILE NAVIGATION TAB (Visible < 768px) */}
      {!(activeModule === 2 && isMercadoMode) && (
        <footer 
          className="md:hidden fixed bottom-3 inset-x-3 bg-white/70 backdrop-blur-lg border border-white/60 p-2.5 flex justify-around items-center z-20 shadow-lg rounded-2xl"
        >
          {modules.slice(0, 5).map(mod => {
            const Icon = mod.icon;
            const isActive = activeModule === mod.id;
   
            return (
              <button
                key={mod.id}
                onClick={() => handleNav(mod.id)}
                className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition ${
                  isActive 
                    ? 'text-indigo-605 font-black scale-105' 
                    : 'text-slate-400 hover:text-slate-650'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-500' : 'text-slate-400'}`} />
                <span>{mod.title.split(' ')[0]}</span>
              </button>
            );
          })}
          {/* Toggle generic sidebar in mobile footer */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold uppercase text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <Menu className="w-5 h-5 text-slate-400" />
            <span>Mais</span>
          </button>
        </footer>
      )}

      {/* GLORIOUS EMERGENCY PANEL MODAL SHEET */}
      {showEmergencyPanel && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto animate-scale-in text-slate-800">
            <button
              onClick={() => setShowEmergencyPanel(false)}
              className="absolute top-5 right-5 p-2 bg-slate-100 hover:bg-slate-250 text-slate-600 rounded-full transition cursor-pointer z-10"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-red-100 pb-4">
                <div className="p-3 bg-red-100/80 text-red-600 rounded-2xl shadow-3xs">
                  <ShieldAlert className="w-7 h-7 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-xl font-sans font-black text-slate-900">PAINEL DE ACESSO INSTANTÂNEO 🚨</h3>
                  <p className="text-xs text-[#4B5563] font-semibold">Visualização crítica obrigatória para moradores e convidados.</p>
                </div>
              </div>

              {/* Grid 1: Public Core Emergency Numbers */}
              <div className="space-y-2.5">
                <h4 className="text-[10.5px] font-black tracking-wider text-slate-400 uppercase font-mono flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-red-500" />
                  Canais de Socorro de Utilidade Oficial (Nacionais)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-red-50/70 p-3 rounded-2xl border border-red-100 text-center">
                    <span className="text-[9px] font-black text-rose-705 uppercase">Bombeiros</span>
                    <p className="text-lg font-mono font-black text-red-650">193</p>
                  </div>
                  <div className="bg-orange-50/70 p-3 rounded-2xl border border-orange-100 text-center">
                    <span className="text-[9px] font-black text-orange-705 uppercase">SAMU</span>
                    <p className="text-lg font-mono font-black text-orange-650">192</p>
                  </div>
                  <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-100 text-center">
                    <span className="text-[9px] font-black text-blue-705 uppercase">Polícia Militar</span>
                    <p className="text-lg font-mono font-black text-blue-650">190</p>
                  </div>
                  <div className="bg-yellow-50/70 p-3 rounded-2xl border border-yellow-250/20 text-center">
                    <span className="text-[9px] font-black text-yellow-705 uppercase">Defesa Civil</span>
                    <p className="text-lg font-mono font-black text-yellow-650">199</p>
                  </div>
                </div>
              </div>

              {/* Grid 2: Custom Saved Emergency Contacts */}
              <div className="space-y-2.5">
                <h4 className="text-[10.5px] font-black tracking-wider text-slate-400 uppercase font-mono">
                  📞 Telefones de Ajuda da Residência (Vizinhos / Administrador)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {state.criticalContacts.filter(cc => cc.category === 'emergência').map(cc => (
                    <div key={cc.id} className="bg-slate-50/70 p-3 rounded-2xl border border-slate-150 flex items-center justify-between shadow-3xs">
                      <div>
                        <p className="text-xs font-black text-[#2D253D]">{cc.title}</p>
                        <p className="text-sm font-mono font-black text-indigo-700">{cc.value}</p>
                      </div>
                      <Phone className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                  {state.criticalContacts.filter(cc => cc.category === 'emergência').length === 0 && (
                    <p className="text-xs text-gray-450 italic py-2">Nenhum telefone secundário adicionado no cofre do sistema.</p>
                  )}
                </div>
              </div>

              {/* Grid 3: Critical Structural Localizations */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <h4 className="text-[10.5px] font-black tracking-wider text-slate-400 uppercase font-mono flex items-center gap-1">
                  <Compass className="w-4 h-4 text-indigo-500" />
                  Instruções & Localização Física de Válvulas Gerais
                </h4>
                
                <div className="space-y-2.5">
                  {/* Default/Saved critical assets localization */}
                  <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-150 shadow-3xs flex gap-3.5">
                    <div className="p-2 bg-emerald-500 text-white rounded-xl self-start">
                      <Droplet className="w-5 h-5 fill-emerald-100/25 text-emerald-100" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-emerald-800 uppercase tracking-wide">Filtro / Fechamento de Água (Geral)</p>
                      <p className="text-xs font-semibold text-slate-700 leading-relaxed mt-0.5">
                        {state.criticalContacts.find(cc => cc.category === 'localização' && cc.title.toLowerCase().includes('água'))?.value || 
                         'O registro de água geral da casa encontra-se na área externa frontal, próximo à calçada à esquerda.'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-150 shadow-3xs flex gap-3.5">
                    <div className="p-2 bg-amber-500 text-white rounded-xl self-start">
                      <Power className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-orange-810 uppercase tracking-wide">Disjuntor Geral / Quadro de Luz</p>
                      <p className="text-xs font-semibold text-slate-700 leading-relaxed mt-0.5">
                        {state.criticalContacts.find(cc => cc.category === 'localização' && cc.title.toLowerCase().includes('luz'))?.value || 
                         'Quadro de energia com chaves fusíveis posicionado no corredor de acesso aos quartos, atrás do espelho.'}
                      </p>
                    </div>
                  </div>

                  {/* Any other localization list */}
                  {state.criticalContacts.filter(cc => cc.category === 'localização' && !cc.title.toLowerCase().includes('luz') && !cc.title.toLowerCase().includes('água')).map(cc => (
                    <div key={cc.id} className="bg-indigo-50/20 p-3 rounded-xl border border-slate-200/60 shadow-3xs flex gap-3">
                      <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg self-start">
                        <Compass className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-indigo-900">{cc.title}</p>
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed mt-0.5">{cc.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  onClick={() => setShowEmergencyPanel(false)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-2xl cursor-pointer"
                >
                  Entendido, Fechar Painel 👍
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
