/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppState, TimeCapsule, AffectiveMemory, UserProfile, CustomTheme } from '../types';
import { 
  Plus, Trash2, Camera, Heart, Lock, Unlock, Clock, Calendar, 
  Settings, Image as ImageIcon, Save, HelpCircle, ThumbsUp, ChevronRight, User, Palette,
  ChevronLeft, X
} from 'lucide-react';

interface AestheticMemoriesViewProps {
  state: AppState;
  addMemory: (title: string, description: string, photoUrl: string, date: string, photoUrls?: string[]) => void;
  deleteMemory: (id: string) => void;
  addTimeCapsule: (title: string, message: string, unlockDate: string) => void;
  deleteTimeCapsule: (id: string) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateColors: (colors: Partial<any>) => void;
  addSavedTheme: (name: string, primary: string, secondary: string, accent: string, backgroundLight: string) => void;
  deleteSavedTheme: (id: string) => void;
}

export default function AestheticMemoriesView({
  state, addMemory, deleteMemory, addTimeCapsule, deleteTimeCapsule, updateProfile, updateColors, addSavedTheme, deleteSavedTheme
}: AestheticMemoriesViewProps) {

  // Selected tab: memories, capsule, settings profile config
  const [activeTab, setActiveTab] = useState<'memories' | 'capsule' | 'profile'>('memories');

  // Memories Form states
  const [mTitle, setMTitle] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mDate, setMDate] = useState(new Date().toISOString().split('T')[0]);
  const [mPhotos, setMPhotos] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState('');

  // Active photo index for polaroid carousels
  const [activePhotoIndexes, setActivePhotoIndexes] = useState<{[key: string]: number}>({});

  // Saved Themes creations form states
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemePrimary, setNewThemePrimary] = useState('#6366f1');
  const [newThemeSecondary, setNewThemeSecondary] = useState('#3b82f6');
  const [newThemeAccent, setNewThemeAccent] = useState('#10b981');
  const [newThemeBackground, setNewThemeBackground] = useState('#f8fafc');

  // Time capsule Form states
  const [cTitle, setCTitle] = useState('');
  const [cMsg, setCMsg] = useState('');
  const [cUnlockDate, setCUnlockDate] = useState(() => {
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() + 1); // 1 year from now default
    return defaultDate.toISOString().split('T')[0];
  });

  // User Profile Form states
  const [pName, setPName] = useState(state.userProfile.name);
  const [pPhoto, setPPhoto] = useState(state.userProfile.avatarUrl || '');
  const [pColorPrimary, setPColorPrimary] = useState(state.colors.primary);
  const [pColorSecondary, setPColorSecondary] = useState(state.colors.secondary);
  const [pColorAccent, setPColorAccent] = useState(state.colors.accent);

  useEffect(() => {
    setPName(state.userProfile.name);
    setPPhoto(state.userProfile.avatarUrl || '');
    setPColorPrimary(state.colors.primary);
    setPColorSecondary(state.colors.secondary);
    setPColorAccent(state.colors.accent);
  }, [state.userProfile, state.colors]);

  // Handle multiple polaroid photos loader
  const handlePhotoLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const readPromises = (Array.from(files) as File[]).map((file) => {
      return new Promise<string>((resolve, reject) => {
        if (file.size > 2 * 1024 * 1024) {
          reject(new Error(`O arquivo "${file.name}" excede o limite de 2MB.`));
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Erro ao carregar imagem.'));
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises)
      .then((results) => {
        setMPhotos(prev => [...prev, ...results]);
      })
      .catch((err) => {
        setPhotoError(err.message);
      });
  };

  const removePhotoFromDraft = (indexToRemove: number) => {
    setMPhotos(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  // Profile avatar loader
  const handleProfilePhotoLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert('Limite sugerido para avatar excedido (1.5MB).');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      setPPhoto(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mTitle.trim() || !mDesc.trim()) return;
    
    // Save with the list of photos (if any) or fallback
    addMemory(mTitle.trim(), mDesc.trim(), mPhotos[0] || '', mDate, mPhotos);
    
    setMTitle('');
    setMDesc('');
    setMPhotos([]);
    setMDate(new Date().toISOString().split('T')[0]);
  };

  const handleSaveCapsule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cTitle.trim() || !cMsg.trim()) return;
    addTimeCapsule(cTitle.trim(), cMsg.trim(), cUnlockDate);
    setCTitle('');
    setCMsg('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: pName.trim() || 'Morador Fantástico',
      avatarUrl: pPhoto
    });
    updateColors({
      primary: pColorPrimary,
      secondary: pColorSecondary,
      accent: pColorAccent
    });

    // Apply color values globally dynamically or reflect values
    document.documentElement.style.setProperty('--theme-primary', pColorPrimary);
    document.documentElement.style.setProperty('--theme-secondary', pColorSecondary);
    document.documentElement.style.setProperty('--theme-accent', pColorAccent);

    alert('Configurações de perfil e paleta aplicadas com sucesso!');
  };

  const handleCreateTheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThemeName.trim()) return;
    addSavedTheme(
      newThemeName.trim(),
      newThemePrimary,
      newThemeSecondary,
      newThemeAccent,
      newThemeBackground
    );
    setNewThemeName('');
    alert(`Tema "${newThemeName}" guardado com sucesso!`);
  };

  const handleApplySavedTheme = (theme: CustomTheme) => {
    updateColors({
      primary: theme.primary,
      secondary: theme.secondary,
      accent: theme.accent,
      backgroundLight: theme.backgroundLight
    });

    document.documentElement.style.setProperty('--theme-primary', theme.primary);
    document.documentElement.style.setProperty('--theme-secondary', theme.secondary);
    document.documentElement.style.setProperty('--theme-accent', theme.accent);
  };

  // Time stamp calculator helper
  const isCapsuleUnlocked = (unlockDateStr: string) => {
    const unlockTime = new Date(unlockDateStr + 'T23:59:59').getTime();
    const nowTime = Date.now();
    return nowTime >= unlockTime;
  };

  const getCapsuleTimeRemaining = (unlockDateStr: string) => {
    const unlockTime = new Date(unlockDateStr + 'T23:59:59').getTime();
    const difference = unlockTime - Date.now();
    if (difference <= 0) return 'Pronta para abrir!';

    const days = Math.ceil(difference / (1000 * 60 * 60 * 24));
    return `Destrava em ${days} dia(s)`;
  };

  const handleNextPhoto = (memId: string, max: number) => {
    setActivePhotoIndexes(prev => {
      const current = prev[memId] || 0;
      return { ...prev, [memId]: (current + 1) % max };
    });
  };

  const handlePrevPhoto = (memId: string, max: number) => {
    setActivePhotoIndexes(prev => {
      const current = prev[memId] || 0;
      return { ...prev, [memId]: (current - 1 + max) % max };
    });
  };

  return (
    <div id="aesthetic-memories-view" className="space-y-6 text-slate-800 animate-fade-in">
      
      {/* Module head */}
      <div className="bg-gradient-to-r from-pink-500/10 via-indigo-500/5 to-transparent p-6 rounded-3xl border border-white/70 shadow-sm">
        <h2 className="text-2xl font-sans font-black tracking-tight text-[#2D253D] flex items-center gap-2">
          <span className="p-1.5 bg-pink-500 text-white rounded-2xl text-base shadow-sm"> M8 </span>
          Memórias Afetivas, Cápsula do Tempo & Temas Guardados
        </h2>
        <p className="text-sm mt-1 text-[#4B5563] font-semibold">
          Evite a duplicação cansativa: carregue fotos simultâneas em carrossel e mude totalmente o visual da sua casa escolhendo temas armazenados com um só toque.
        </p>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-rose-100 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('memories')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer rounded-t-2xl border-x border-t transition-all ${
            activeTab === 'memories'
              ? 'bg-white/80 border-rose-100 border-b-white text-[#2D253D] font-black scale-105 shadow-2xs'
              : 'text-gray-500 hover:text-[#2D253D] border-transparent'
          }`}
        >
          📷 Álbum de Recordações (Série Carrossel)
        </button>
        <button
          onClick={() => setActiveTab('capsule')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer rounded-t-2xl border-x border-t transition-all ${
            activeTab === 'capsule'
              ? 'bg-white/80 border-rose-100 border-b-white text-[#2D253D] font-black scale-105 shadow-2xs'
              : 'text-gray-500 hover:text-[#2D253D] border-transparent'
          }`}
        >
          🔒 Cápsula do Tempo Secreta
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer rounded-t-2xl border-x border-t transition-all ${
            activeTab === 'profile'
              ? 'bg-white/80 border-rose-100 border-b-white text-[#2D253D] font-black scale-105 shadow-2xs'
              : 'text-gray-500 hover:text-[#2D253D] border-transparent'
          }`}
        >
          🎨 Personalização de Temas & Perfil
        </button>
      </div>

      {/* RENDER ACTIVE FORUM */}
      <div className="pt-2">
        
        {/* TAB 1: POLAROID RECORD ALBUM WITH MULTIPLE PHOTOS IN CAROUSEL */}
        {activeTab === 'memories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: input memories finder */}
            <div className="lg:col-span-1 bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm space-y-4 self-start font-sans">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-[#2D253D]">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
                Registrar Nova Recordação
              </h3>

              <form onSubmit={handleSaveMemory} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Título do Momento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Almoço de Domingo com Amigos"
                    value={mTitle}
                    onChange={e => setMTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-medium focus:border-rose-400 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Descrição Afetiva *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Ex: Dia inesquecível em que fizemos um churrasco e montamos uma fogueira no jardim..."
                    value={mDesc}
                    onChange={e => setMDesc(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-medium focus:border-rose-400 outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Quando Aconteceu *</label>
                    <input
                      type="date"
                      required
                      value={mDate}
                      onChange={e => setMDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold font-mono outline-none focus:border-rose-400 text-[#2D253D]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 block">Fotos do Momento (Arquivos múltiplos)</label>
                    <div className="flex flex-col gap-2 p-3 bg-rose-50/25 border border-dashed border-rose-200 rounded-xl text-center">
                      <Camera className="w-6 h-6 text-rose-400 mx-auto" />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoLoad}
                        className="text-[11px] text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-rose-50 hover:file:bg-rose-100/70 cursor-pointer"
                        id="multi-photo-input"
                      />
                      <span className="text-[9px] text-gray-400 font-medium">Você pode selecionar várias fotos de uma vez</span>
                    </div>
                    {photoError && <p className="text-[10px] text-rose-500 font-bold">{photoError}</p>}
                  </div>
                </div>

                {/* Draft list of multiple uploaded photos */}
                {mPhotos.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-black text-gray-600 block">Fotos Pré-selecionadas ({mPhotos.length}):</p>
                    <div className="grid grid-cols-4 gap-2 bg-white/50 p-2.5 border border-slate-100 rounded-2xl max-h-32 overflow-y-auto">
                      {mPhotos.map((photo, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-100 bg-slate-50 shadow-sm">
                          <img src={photo} className="w-full h-full object-cover" alt="Draft upload" />
                          <button
                            type="button"
                            onClick={() => removePhotoFromDraft(index)}
                            className="absolute top-0.5 right-0.5 p-0.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow flex items-center justify-center cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 active:scale-98 text-white rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md shadow-rose-900/10 transition-all flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Salvar Recordação no Álbum
                </button>
              </form>
            </div>

            {/* Right: Browse Polaroid cells cards */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">
                
                {state.affectiveMemories.map(mem => {
                  const photosList = mem.photoUrls && mem.photoUrls.length > 0 ? mem.photoUrls : (mem.photoUrl ? [mem.photoUrl] : []);
                  const hasPhotos = photosList.length > 0;
                  const currentIdx = activePhotoIndexes[mem.id] || 0;
                  const activePhoto = hasPhotos ? photosList[currentIdx] : null;

                  return (
                    <div 
                      key={mem.id}
                      className="bg-[#faf6eb] text-slate-800 p-4 pb-6 rounded-sm shadow-xl border border-[#e8dfc7] hover:scale-[1.01] transition-transform duration-300 max-w-sm mx-auto w-full relative"
                    >
                      {/* Visual Polaroid photo bracket with Carousel Controls */}
                      <div className="bg-slate-950 h-60 w-full flex items-center justify-center overflow-hidden border border-[#d2c9b4] rounded-xs relative group-image">
                        {activePhoto ? (
                          <img 
                            src={activePhoto} 
                            alt={`Photo ${currentIdx + 1} of ${mem.title}`} 
                            referrerPolicy="no-referrer" 
                            className="w-full h-full object-cover animate-fade-in" 
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-500 gap-1.5 text-center p-4">
                            <Camera className="w-9 h-9 text-rose-455" />
                            <span className="text-[11px] font-medium leading-relaxed italic">"Colecione momentos físicos para guardar no coração."</span>
                          </div>
                        )}

                        {/* Slide Navigation Overlay if multiple files */}
                        {hasPhotos && photosList.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() => handlePrevPhoto(mem.id, photosList.length)}
                              className="absolute left-1.5 p-1.5 bg-white/70 backdrop-blur-md text-slate-800 hover:bg-white rounded-full shadow-md z-10 transition cursor-pointer"
                              title="Anterior"
                            >
                              <ChevronLeft className="w-3.5 h-3.5 font-bold" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleNextPhoto(mem.id, photosList.length)}
                              className="absolute right-1.5 p-1.5 bg-white/70 backdrop-blur-md text-slate-800 hover:bg-white rounded-full shadow-md z-10 transition cursor-pointer"
                              title="Próxima"
                            >
                              <ChevronRight className="w-3.5 h-3.5 font-bold" />
                            </button>

                            {/* Mini index bubble indicator dots */}
                            <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1 z-10">
                              {photosList.map((_, dotIdx) => (
                                <span 
                                  key={dotIdx} 
                                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                                    dotIdx === currentIdx 
                                      ? 'bg-rose-500 scale-125' 
                                      : 'bg-white/50 hover:bg-white/80'
                                  }`} 
                                />
                              ))}
                            </div>

                            {/* Multi-Photo Count Bagde */}
                            <span className="absolute top-2 left-2 bg-slate-900/70 backdrop-blur-3xs text-white text-[9px] font-bold px-2 py-0.5 rounded-lg border border-white/10">
                              {currentIdx + 1} / {photosList.length} fotos
                            </span>
                          </>
                        )}
                      </div>

                      {/* Polaroid spaces descriptiors */}
                      <div className="pt-4 text-center font-serif text-slate-800">
                        <h4 className="font-bold text-md leading-tight tracking-tight mt-1 capitalize text-amber-950">{mem.title}</h4>
                        <p className="text-xs italic text-amber-900/80 mt-2 font-mono mx-1 leading-relaxed">
                          "{mem.description}"
                        </p>
                        
                        <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 mt-4 border-t border-dashed border-amber-200/85 pt-2 px-1">
                          <span>{mem.date.split('-').reverse().join('/')}</span>
                          <span className="font-black text-rose-600 flex items-center gap-0.5">
                            ❤️ Casa Doce Lar
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm('Apagar esta lembrança do álbum polaroid?')) deleteMemory(mem.id);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white transition duration-200 text-rose-600 rounded-lg shadow-2xs cursor-pointer"
                        title="Deletar Lembrança"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}

              </div>
              {state.affectiveMemories.length === 0 && (
                <div className="text-center py-12 text-sm text-gray-500 italic font-semibold">
                  Nenhuma Polaroid afetiva criada. Registre momentos marcantes e veja as imagens ganharem vida em carrossel.
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: TIME CAPSULE UNDERLOCK TIMER PROGRESS */}
        {activeTab === 'capsule' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Input Form */}
            <div className="lg:col-span-1 bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm space-y-4 self-start">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-[#2D253D]">
                <Lock className="w-5 h-5 text-rose-500 fill-rose-500" />
                Criar Nova Cápsula Secreta
              </h3>
              <p className="text-xs text-[#4B5563] font-semibold leading-relaxed">
                Escreva palpites, sentimentos ou conselhos e tranque. Ela ficará totalmente inacessível até a data configurada bater rigorosamente.
              </p>

              <form onSubmit={handleSaveCapsule} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Título da Cápsula</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Metas para daqui a 1 ano..."
                    value={cTitle}
                    onChange={e => setCTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-medium focus:border-rose-400 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Sua Mensagem Secreta *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Escreva aqui tudo o que sente hoje. Lembre-se de perguntar se as metas foram atingidas..."
                    value={cMsg}
                    onChange={e => setCMsg(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-medium focus:border-rose-400 outline-none resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 font-mono">Data de Destravamento</label>
                  <input
                    type="date"
                    required
                    value={cUnlockDate}
                    onChange={e => setCUnlockDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-bold font-mono outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 active:scale-98 text-white rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  Selar e Enterrar Cápsula 🏺
                </button>
              </form>
            </div>

            {/* Browse and check locked/unlocked capsules */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6">
                
                {state.timeCapsules.map(cap => {
                  const unlocked = isCapsuleUnlocked(cap.unlockDate);
                  const timerText = getCapsuleTimeRemaining(cap.unlockDate);

                  return (
                    <div 
                      key={cap.id} 
                      className={`p-5 rounded-3xl border transition-all ${
                        unlocked 
                          ? 'bg-emerald-50/50 border-emerald-200 text-slate-800' 
                          : 'bg-white/70 backdrop-blur-md border-white/60 shadow-sm text-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="p-2 rounded-xl bg-orange-100 flex items-center justify-center">
                          {unlocked ? <Unlock className="w-5 h-5 text-emerald-600 animate-bounce" /> : <Lock className="w-5 h-5 text-rose-500" />}
                        </div>
                        
                        <div className="text-right">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            unlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-50 border border-rose-100 text-rose-600'
                          }`}>
                            {timerText}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <h4 className="font-bold text-md text-[#2D253D] leading-tight">{cap.title}</h4>
                        
                        {unlocked ? (
                          <p className="text-xs bg-white/75 p-3 rounded-xl border border-slate-100 italic break-words leading-relaxed text-[#4B5563]">
                            "{cap.message}"
                          </p>
                        ) : (
                          <div className="p-3 bg-slate-50/70 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center gap-1 select-none py-6">
                            <Clock className="w-5 h-5 text-slate-400" />
                            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Conteúdo Selado</p>
                            <p className="text-[9px] text-gray-400 font-mono">Disponível em {cap.unlockDate.split('-').reverse().join('/')}</p>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 border-t border-slate-100 pt-2.5 mt-2">
                          <span>Escreveu em {cap.createdAt?.split('T')[0]?.split('-')?.reverse()?.join('/') || '01/06/2026'}</span>
                          <button
                            onClick={() => {
                              if (confirm('Deletar permanentemente esta cápsula?')) deleteTimeCapsule(cap.id);
                            }}
                            className="text-rose-600 hover:underline flex items-center gap-0.5 text-[10px] font-bold cursor-pointer"
                          >
                            Destruir
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

              </div>
              {state.timeCapsules.length === 0 && (
                <div className="text-center py-12 text-sm text-gray-500 italic font-semibold">
                  Nenhuma cápsula do tempo guardada no solo.
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: PERSONALIZATION OF THEMES & USER PROFILE */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left: Standard profile settings Form */}
            <div className="space-y-6">
              <form onSubmit={handleSaveProfile} className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm space-y-6">
                <h3 className="font-bold text-md text-[#2D253D] uppercase tracking-wider flex items-center gap-2">
                  <User className="w-5 h-5 text-rose-500" />
                  Identidade Principal & Ajuste Hexadecimal Manual
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase font-mono">Nome do Morador Principal *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Clara de Souza"
                      value={pName}
                      onChange={e => setPName(e.target.value)}
                      className="w-full px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-sm font-semibold focus:border-[#theme-primary] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase font-mono">Avatar / Foto de Perfil</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePhotoLoad}
                      className="w-full text-xs file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-rose-50 cursor-pointer"
                    />
                    <p className="text-[10px] text-gray-400 mt-1 font-semibold">Carregar imagem menor que 1.5MB.</p>
                  </div>
                </div>

                {/* Preview Avatar card */}
                <div className="p-4 bg-slate-50/50 border border-slate-150 rounded-2xl flex items-center gap-4 text-sm font-semibold max-w-sm">
                  {pPhoto ? (
                    <img src={pPhoto} alt="Avatar Morador" referrerPolicy="no-referrer" className="w-16 h-16 object-cover rounded-full border border-slate-200 bg-white" />
                  ) : (
                    <div className="w-16 h-16 bg-rose-100 text-rose-500 flex items-center justify-center rounded-full shadow-sm">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                  <div>
                    <p className="text-gray-400 text-xs">Visualização do Morador:</p>
                    <p className="text-md font-black text-[#2D253D] capitalize">{pName || 'Morador Vazio'}</p>
                  </div>
                </div>

                {/* Manual Palette Hex Colors */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-black uppercase text-gray-600 font-mono">Seleção Hexadecimal Dinâmica Manual:</h4>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 font-mono block">Tom Principal</label>
                      <div className="flex gap-1">
                        <input
                          type="color"
                          value={pColorPrimary}
                          onChange={e => setPColorPrimary(e.target.value)}
                          className="w-8 h-8 border border-slate-200 rounded-lg bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={pColorPrimary}
                          onChange={e => setPColorPrimary(e.target.value)}
                          className="w-full px-1.5 py-1 text-[10px] font-mono font-bold uppercase bg-white border border-slate-200 rounded-lg text-center"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 font-mono block">Tom Secundário</label>
                      <div className="flex gap-1">
                        <input
                          type="color"
                          value={pColorSecondary}
                          onChange={e => setPColorSecondary(e.target.value)}
                          className="w-8 h-8 border border-slate-200 rounded-lg bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={pColorSecondary}
                          onChange={e => setPColorSecondary(e.target.value)}
                          className="w-full px-1.5 py-1 text-[10px] font-mono font-bold uppercase bg-white border border-slate-200 rounded-lg text-center"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 font-mono block">Destaque Accent</label>
                      <div className="flex gap-1">
                        <input
                          type="color"
                          value={pColorAccent}
                          onChange={e => setPColorAccent(e.target.value)}
                          className="w-8 h-8 border border-slate-200 rounded-lg bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={pColorAccent}
                          onChange={e => setPColorAccent(e.target.value)}
                          className="w-full px-1.5 py-1 text-[10px] font-mono font-bold uppercase bg-white border border-slate-200 rounded-lg text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-900/15"
                >
                  <Save className="w-4 h-4" />
                  Aplicar Configurações Actuais
                </button>
              </form>
            </div>

            {/* Right: Meus Temas Guardados (Saved Themes Stations of 4-palettes) */}
            <div className="space-y-6">
              
              {/* Creator form for themed spectrum palettes */}
              <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-[#2D253D] uppercase tracking-wider flex items-center gap-2">
                  <Palette className="w-5 h-5 text-pink-500" />
                  Salvar Nova Paleta de Cores Completa
                </h3>
                <p className="text-xs text-[#4B5563] font-semibold">
                  Insira o nome desejado para o tema e escolha as 4 cores base de uma só vez para registrá-la em sua coleção.
                </p>

                <form onSubmit={handleCreateTheme} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 block">Nome da Sua Paleta *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Floresta Verdejante 🌳"
                      value={newThemeName}
                      onChange={e => setNewThemeName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white/60 border border-slate-200 rounded-xl text-xs font-semibold focus:border-rose-450 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 font-mono block text-center">Primário</label>
                      <input
                        type="color"
                        value={newThemePrimary}
                        onChange={e => setNewThemePrimary(e.target.value)}
                        className="w-full h-9 rounded-lg border border-slate-200 bg-transparent cursor-pointer shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 font-mono block text-center">Secundário</label>
                      <input
                        type="color"
                        value={newThemeSecondary}
                        onChange={e => setNewThemeSecondary(e.target.value)}
                        className="w-full h-9 rounded-lg border border-slate-200 bg-transparent cursor-pointer shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 font-mono block text-center">Accent</label>
                      <input
                        type="color"
                        value={newThemeAccent}
                        onChange={e => setNewThemeAccent(e.target.value)}
                        className="w-full h-9 rounded-lg border border-slate-200 bg-transparent cursor-pointer shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 font-mono block text-center">Fundo Suave</label>
                      <input
                        type="color"
                        value={newThemeBackground}
                        onChange={e => setNewThemeBackground(e.target.value)}
                        className="w-full h-9 rounded-lg border border-slate-200 bg-transparent cursor-pointer shadow-2xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl cursor-pointer"
                  >
                    Guardar Paleta na Coleção 💾
                  </button>
                </form>
              </div>

              {/* Browse Saved Theme Cards */}
              <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#2D253D] font-mono">
                  Minhas Paletas & Temas Guardados por Mim
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(state.savedThemes || []).map(theme => (
                    <div 
                      key={theme.id}
                      onClick={() => handleApplySavedTheme(theme)}
                      className="p-4 bg-white/85 border border-slate-150 rounded-2xl hover:scale-102 hover:border-pink-300 transition-all cursor-pointer shadow-2xs relative group"
                    >
                      <div className="space-y-2">
                        <p className="text-xs font-extrabold text-[#2D253D] leading-tight select-none pr-6">{theme.name}</p>
                        
                        {/* 4 Colored Spectrum Bars */}
                        <div className="flex h-5 w-full rounded-lg overflow-hidden border border-slate-100 shadow-2xs">
                          <div className="flex-1" style={{ backgroundColor: theme.primary }} title={`Primário: ${theme.primary}`} />
                          <div className="flex-1" style={{ backgroundColor: theme.secondary }} title={`Secundário: ${theme.secondary}`} />
                          <div className="flex-1" style={{ backgroundColor: theme.accent }} title={`Destaque Accent: ${theme.accent}`} />
                          <div className="flex-1" style={{ backgroundColor: theme.backgroundLight }} title={`Fundo Suave: ${theme.backgroundLight}`} />
                        </div>

                        <p className="text-[8.5px] text-gray-400 font-mono uppercase text-center tracking-wider">Toque para aplicar na casa toda</p>
                      </div>

                      {/* Delete saved custom theme (if it starts with custom theme ID layout index) */}
                      {theme.id.startsWith('theme-') && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Deletar permanetemente este tema de sua coleção?')) deleteSavedTheme(theme.id);
                          }}
                          className="absolute top-2.5 right-2.5 p-1 bg-red-100 hover:bg-red-500 hover:text-white text-red-600 rounded-lg hover:shadow transition duration-200 flex items-center justify-center cursor-pointer"
                          title="Remover Paleta"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {(state.savedThemes || []).length === 0 && (
                  <p className="text-[#4B5563] text-xs font-semibold text-center italic py-4">Nenhuma paleta personalizada guardada.</p>
                )}
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
