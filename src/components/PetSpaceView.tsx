import React, { useState } from 'react';
import { 
  Cat, Heart, Plus, Trash, Check, Calendar, TrendingUp, Sparkles, 
  Package, ShoppingCart, Scale, Syringe, FileText, CheckCircle2, 
  ChevronRight, X, AlertTriangle, CloudLightning, DollarSign, Edit3
} from 'lucide-react';
import { AppState, CatProfile, SupplyPackage, VaccineRecord, VetRecord } from '../types';

interface PetSpaceViewProps {
  state: AppState;
  updateCatProfile: (id: string, name: string, photoUrl: string) => void;
  addCatVaccine: (catId: string, name: string, appliedDate: string, nextDoseDate: string) => void;
  deleteCatVaccine: (catId: string, vaccineId: string) => void;
  addCatVetRecord: (catId: string, date: string, weight: number, reason: string, cost?: number) => void;
  deleteCatVetRecord: (catId: string, recordId: string) => void;
  addPetSupply: (type: 'ração' | 'areia', brand: string, quantity: string, openedDate: string) => void;
  finishPetSupply: (id: string, finishedDate: string) => void;
  deletePetSupply: (id: string) => void;
  addPurchaseItem: (name: string, category: string, quantity: number, unitPrice: number, recommendedBrand?: string) => void;
}

export default function PetSpaceView({
  state,
  updateCatProfile,
  addCatVaccine,
  deleteCatVaccine,
  addCatVetRecord,
  deleteCatVetRecord,
  addPetSupply,
  finishPetSupply,
  deletePetSupply,
  addPurchaseItem
}: PetSpaceViewProps) {
  const cats = state.cats || [];
  const supplies = state.petSupplies || [];

  // Shared glassmorphic style for jateado glass cards
  const jateadoGlassStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
  };

  // Customizable title tag state (with localStorage persistence)
  const [customTag, setCustomTag] = useState(() => {
    return localStorage.getItem('minhas_gatas_custom_tag') || '';
  });

  // Active view state
  const [selectedCat, setSelectedCat] = useState<CatProfile | null>(null);
  
  // Vaccine submission form states
  const [vacName, setVacName] = useState('');
  const [vacDate, setVacDate] = useState(new Date().toISOString().split('T')[0]);
  const [vacNextDate, setVacNextDate] = useState('');

  // Vet visit form states
  const [vetDate, setVetDate] = useState(new Date().toISOString().split('T')[0]);
  const [vetWeight, setVetWeight] = useState('');
  const [vetReason, setVetReason] = useState('');
  const [vetCost, setVetCost] = useState('');

  // Register supply form states
  const [showSupplyForm, setShowSupplyForm] = useState(false);
  const [supType, setSupType] = useState<'ração' | 'areia'>('ração');
  const [supBrand, setSupBrand] = useState('');
  const [supQuantity, setSupQuantity] = useState('');
  const [supOpenedDate, setSupOpenedDate] = useState(new Date().toISOString().split('T')[0]);

  // Editing cat image base64 state
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  // Image upload handler
  const handleCatPhotoUpload = (catId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const cat = cats.find(c => c.id === catId);
        updateCatProfile(catId, cat?.name || '', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateDaysBetween = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDaysAgo = (dateStr: string) => {
    const start = new Date(dateStr);
    const today = new Date();
    // Zero out hours to calculate standard offset
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - start.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Yield Calculator Engine
  const getConsumptionStats = (type: 'ração' | 'areia') => {
    const finishedPackages = supplies.filter(s => s.type === type && s.finished && s.finishedDate);
    if (finishedPackages.length === 0) {
      return { msg: 'Registrando consumo médio...', averageDays: null };
    }

    let totalDays = 0;
    finishedPackages.forEach(pkg => {
      totalDays += calculateDaysBetween(pkg.openedDate, pkg.finishedDate!);
    });

    const avg = Math.round(totalDays / finishedPackages.length);
    const itemLabel = type === 'ração' ? 'Um pacote de Ração' : 'Um saco de Areia';
    return {
      msg: `${itemLabel} dura em média ${avg} dias.`,
      averageDays: avg
    };
  };

  const handleSuplementToShopping = (itemName: string, recommendedBrand?: string) => {
    // Adds directly to shopping list M2
    addPurchaseItem(itemName, 'Supermercado', 1, 0, recommendedBrand);
    alert(`"${itemName}" adicionado com sucesso à sua lista de compras!`);
  };

  // Quick suggestions based on status
  const getPetSuggestions = () => {
    const activeFood = supplies.find(s => s.type === 'ração' && !s.finished);
    const activeLitter = supplies.find(s => s.type === 'areia' && !s.finished);
    
    const foodStats = getConsumptionStats('ração');
    const litterStats = getConsumptionStats('areia');

    const suggestions = [];

    // Check if active food is empty or opened too long
    if (activeFood) {
      const parsedDays = getDaysAgo(activeFood.openedDate);
      if (foodStats.averageDays && parsedDays > foodStats.averageDays - 7) {
        suggestions.push({
          name: 'Ração Seca Gatas Castradas',
          reason: 'A ração atual está perto do fim estimado!',
          brand: activeFood.brand
        });
      }
    } else {
      suggestions.push({
        name: 'Ração Seca Gatas Castradas 7.5kg',
        reason: 'Sem pacotes de ração abertos no estoque!',
        brand: 'PremieR Gatos Castrados'
      });
    }

    if (activeLitter) {
      const parsedDays = getDaysAgo(activeLitter.openedDate);
      if (litterStats.averageDays && parsedDays > litterStats.averageDays - 5) {
        suggestions.push({
          name: 'Areia Higiênica Biodegradável',
          reason: 'A areia do estoque está nos últimos dias de uso!',
          brand: activeLitter.brand
        });
      }
    } else {
      suggestions.push({
        name: 'Areia Higiênica Saco 4kg',
        reason: 'Nenhuma areia em uso registrado.',
        brand: 'Viva Verde Areia'
      });
    }

    // Default static items
    suggestions.push({
      name: 'Sachê Premium de Carne/Salmão (Caixa)',
      reason: 'Estoque fixo rotineiro de petiscos',
      brand: 'Sachê Whiskas ou Fancy Feast'
    });

    suggestions.push({
      name: 'Vermífugo Felino Pipeta',
      reason: 'Prevenção trimestral recomendada',
      brand: 'Vermivet ou Advocate Gatos'
    });

    return suggestions;
  };

  const handleCloseCatModal = () => {
    setSelectedCat(null);
    setVacName('');
    setVacNextDate('');
    setVetWeight('');
    setVetReason('');
    setVetCost('');
  };

  return (
    <div id="pet-space-view" className="space-y-8 animate-fade-in text-slate-800">
      
      {/* Header Info Banner */}
      <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/5 to-transparent p-5 rounded-3xl border border-white/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-pink-100 text-pink-500 rounded-xl">
              <Cat className="w-6 h-6 animate-pulse" />
            </div>
            <h1 className="text-2xl font-sans font-black tracking-tight text-[#2D253D]">Minhas Gatas</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customTag}
            placeholder="Clique para legenda..."
            onChange={(e) => {
              setCustomTag(e.target.value);
              localStorage.setItem('minhas_gatas_custom_tag', e.target.value);
            }}
            className="px-3 py-1 bg-white/40 hover:bg-white/60 focus:bg-white/80 border border-pink-200 text-pink-600 font-extrabold text-xs uppercase tracking-wider rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-400 text-center w-40 transition-colors"
            title="Clique para editar esta tag"
          />
        </div>
      </div>

      {/* Individual Profiles of Cats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cats.map(cat => (
          <div 
            key={cat.id} 
            style={jateadoGlassStyle}
            className="hover:translate-y-[-2px] transition-all duration-300 rounded-2.5xl p-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Photo Area */}
              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center">
                {cat.photoUrl ? (
                  <img 
                    src={cat.photoUrl} 
                    alt={cat.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-1.5 text-slate-400">
                    <Cat className="w-9 h-9 stroke-[1.5]" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Sem Foto</span>
                  </div>
                )}
                
                {/* Upload Action Overlay */}
                <label className="absolute bottom-2 right-2 p-1.5 bg-white/80 hover:bg-white text-slate-700 rounded-lg shadow-sm cursor-pointer flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
                  <Edit3 className="w-3 h-3 text-indigo-600" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleCatPhotoUpload(cat.id, e)} 
                    className="hidden" 
                  />
                </label>
              </div>

              {/* Title Header */}
              <div className="flex items-center justify-between">
                <div>
                  {editingCatId === cat.id ? (
                    <div className="flex items-center gap-1">
                      <input 
                        type="text" 
                        value={editingCatName} 
                        onChange={(e) => setEditingCatName(e.target.value)}
                        className="p-1 px-1.5 border border-slate-200 rounded-md text-xs font-bold w-24 bg-white"
                        autoFocus
                      />
                      <button 
                        onClick={() => {
                          if (editingCatName.trim()) {
                            updateCatProfile(cat.id, editingCatName.trim(), cat.photoUrl);
                          }
                          setEditingCatId(null);
                        }}
                        className="p-1 bg-green-500 text-white rounded-md"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <h3 className="text-sm font-sans font-black text-slate-800">{cat.name}</h3>
                      <button 
                        onClick={() => {
                          setEditingCatId(cat.id);
                          setEditingCatName(cat.name);
                        }}
                        className="text-slate-400 hover:text-indigo-600 transition"
                        title="Renomear Gata"
                      >
                        <Edit3 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}

                  {/* Weight Summary badge */}
                  <div className="flex items-center gap-1 text-slate-500 text-[10px] mt-0.5">
                    <Scale className="w-3 h-3 text-slate-400" />
                    <span>
                      {cat.vetRecords?.length > 0 
                        ? `${cat.vetRecords[0].weight}kg` 
                        : 'Sem peso'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="p-0.5 bg-pink-100/40 text-pink-500 rounded text-[10px]" title="Gatinha">
                    🐱
                  </span>
                </div>
              </div>

              {/* Vaccines quick info */}
              <div className="border-t border-white/10 pt-2 space-y-1.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#94A3B8]">Últimas Vacinas</p>
                {cat.vaccines?.slice(0, 2).map(v => (
                  <div key={v.id} className="flex justify-between items-center bg-white/20 p-1.5 rounded-lg text-[10px]">
                    <div className="flex items-center gap-1 truncate">
                      <Syringe className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="font-bold truncate max-w-[100px]">{v.name}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono shrink-0">{v.appliedDate}</span>
                  </div>
                ))}
                {cat.vaccines?.length === 0 && (
                  <p className="text-[10px] text-slate-450 italic">Sem vacinas.</p>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                // Focus & open details overlay
                setSelectedCat(cat);
              }}
              className="mt-3 w-full py-1.5 bg-white/20 hover:bg-pink-100/30 text-[#6366f1] font-black text-[10px] uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <FileText className="w-3 h-3" />
              Prontuário de Saúde
              <ChevronRight className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Shared Supplies Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        
        {/* Supplies register and list (Left 2 cols) */}
        <div style={jateadoGlassStyle} className="lg:col-span-2 rounded-[2.2rem] p-6 space-y-6">
          <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-3 border-b border-slate-200/50 pb-4">
            <div>
              <h3 className="text-lg font-sans font-black text-slate-800 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-550" />
                Estoque e Insumos Compartilhados 🥫
              </h3>
              <p className="text-xs text-[#64748B] font-semibold mt-0.5">Gestão de pacotes abertos de ração e areia de Leandra Vittoria.</p>
            </div>
            <button
              onClick={() => setShowSupplyForm(!showSupplyForm)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Pacote
            </button>
          </div>

          {/* New Supply Package Form */}
          {showSupplyForm && (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!supBrand.trim() || !supQuantity.trim()) return;
                addPetSupply(supType, supBrand.trim(), supQuantity.trim(), supOpenedDate);
                setSupBrand('');
                setSupQuantity('');
                setShowSupplyForm(false);
              }}
              className="bg-slate-50/70 p-4 rounded-2.5xl border border-slate-200/50 space-y-4 animate-scale-in"
            >
              <h4 className="text-xs font-black uppercase text-indigo-950 tracking-wider">Adicionar Registro de Insumo</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Categoria</label>
                  <select
                    value={supType}
                    onChange={(e) => setSupType(e.target.value as any)}
                    className="w-full p-2 border border-slate-250 rounded-xl text-xs font-bold bg-white"
                  >
                    <option value="ração">Ração Seca 🥩</option>
                    <option value="areia">Areia Higiênica 📦</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Marca / Especificação</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: PremieR Castrados Salmão"
                    value={supBrand}
                    onChange={(e) => setSupBrand(e.target.value)}
                    className="w-full p-2 border border-slate-250 rounded-xl text-xs font-bold bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Quantidade (Peso)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 7.5kg ou 4kg"
                    value={supQuantity}
                    onChange={(e) => setSupQuantity(e.target.value)}
                    className="w-full p-2 border border-slate-250 rounded-xl text-xs font-bold bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Data de Abertura</label>
                  <input
                    type="date"
                    required
                    value={supOpenedDate}
                    onChange={(e) => setSupOpenedDate(e.target.value)}
                    className="w-full p-2 border border-slate-250 rounded-xl text-xs font-mono font-bold bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSupplyForm(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  Confirmar Abertura 🚀
                </button>
              </div>
            </form>
          )}

          {/* Grid list of active/historic packages */}
          <div className="space-y-4">
            
            {/* Active Packages Section */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-[#64748B] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                Insumos Atualmente em Uso (Abertos)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {supplies.filter(s => !s.finished).map(pkg => {
                  const daysAgo = getDaysAgo(pkg.openedDate);
                  const stats = getConsumptionStats(pkg.type);

                  return (
                    <div key={pkg.id} className="bg-white/40 p-4 rounded-2.5xl border border-white/40 shadow-3xs flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                            pkg.type === 'ração' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-sky-50 text-sky-700 border border-sky-200'
                          }`}>
                            {pkg.type === 'ração' ? 'Ração 🍖' : 'Areia' }  ({pkg.quantity})
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono font-semibold">Aberto em {pkg.openedDate}</span>
                        </div>
                        <h5 className="font-extrabold text-sm text-slate-800 mt-2 truncate">{pkg.brand}</h5>
                        <p className="text-xs text-indigo-700 font-bold mt-1 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {daysAgo === 0 ? 'Aberto hoje' : `Aberto há ${daysAgo} dia(s)`}
                        </p>

                        {/* Yield estimate warning block */}
                        {stats.averageDays && (
                          <div className="mt-2 text-[10.5px] bg-[#6366f1]/5 border border-[#6366f1]/10 rounded-xl p-2 text-indigo-850 font-medium">
                            {daysAgo > stats.averageDays ? (
                              <span className="text-amber-700 font-bold">⚠️ Rendeu mais que a média de ${stats.averageDays} dias!</span>
                            ) : (
                              <span>Estimativa: restam aproximadamente <b>{stats.averageDays - daysAgo}</b> dias de uso.</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between gap-2 border-t border-slate-200/50 pt-2.5">
                        <button
                          onClick={() => deletePetSupply(pkg.id)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition"
                          title="Excluir"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const dateStr = window.prompt("Digite a data em que o pacote esgotou (AAAA-MM-DD):", new Date().toISOString().split('T')[0]);
                            if (dateStr) {
                              finishPetSupply(pkg.id, dateStr);
                            }
                          }}
                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Marcar Esgotado
                        </button>
                      </div>
                    </div>
                  );
                })}
                {supplies.filter(s => !s.finished).length === 0 && (
                  <p className="text-xs text-slate-400 italic sm:col-span-2 py-4">Sem nenhum insumo ativamente aberto. Registre um novo pacote acima!</p>
                )}
              </div>
            </div>

            {/* Finished History (Yield Statistics) */}
            <div className="pt-2">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-[#64748B]">
                Histórico de Rendimento (Análise de Consumo)
              </h4>
              <div className="mt-2.5 space-y-2">
                {supplies.filter(s => s.finished).map(pkg => {
                  const duration = calculateDaysBetween(pkg.openedDate, pkg.finishedDate || pkg.openedDate);
                  return (
                    <div key={pkg.id} className="flex justify-between items-center text-xs bg-slate-50/50 p-3 rounded-2xl border border-slate-150">
                      <div>
                        <span className="font-extrabold text-slate-800">{pkg.brand}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Aberto: {pkg.openedDate} | Esgotado: {pkg.finishedDate}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-indigo-50/80 text-indigo-700 font-mono font-black rounded-lg">
                        Durou {duration} dias 📆
                      </span>
                    </div>
                  );
                })}
                {supplies.filter(s => s.finished).length === 0 && (
                  <p className="text-xs text-slate-400 italic py-2">Sem histórico de pacotes encerrados ainda.</p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Smart Pet Refill Suggestions sidebar (Right column) */}
        <div style={jateadoGlassStyle} className="rounded-[2.2rem] p-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-md font-sans font-black text-slate-800 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-pink-500" />
                Dicas de Reabastecimento 🛒
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Dicas geradas automaticamente com base no ritmo de uso médio.</p>
            </div>

            {/* Consumption Rules boxes */}
            <div className="space-y-3">
              <div className="bg-amber-50/45 border border-amber-100 p-3.5 rounded-2.5xl">
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 font-mono">Consumo Médio Ração</span>
                <p className="text-xs font-extrabold text-amber-900 mt-0.5 leading-snug">
                  {getConsumptionStats('ração').msg}
                </p>
              </div>

              <div className="bg-sky-50/45 border border-sky-100 p-3.5 rounded-2.5xl">
                <span className="text-[9px] font-black uppercase tracking-wider text-sky-700 font-mono">Consumo Médio Areia</span>
                <p className="text-xs font-extrabold text-sky-900 mt-0.5 leading-snug">
                  {getConsumptionStats('areia').msg}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200/50 pt-4 space-y-3">
              <h4 className="text-[10.5px] font-black uppercase text-slate-400 tracking-widest">Sugestões de Compras Rápidas</h4>
              <div className="space-y-3">
                {getPetSuggestions().map((sug, idx) => (
                  <div key={idx} className="bg-white/40 p-3.5 rounded-2.5xl border border-white/30 flex justify-between items-start gap-2 shadow-2xs">
                    <div>
                      <p className="text-xs font-extrabold text-slate-800 leading-snug">{sug.name}</p>
                      <p className="text-[10.5px] text-indigo-700 font-medium mt-1">{sug.reason}</p>
                      {sug.brand && <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Sugerido: {sug.brand}</span>}
                    </div>
                    <button
                      onClick={() => handleSuplementToShopping(sug.name, sug.brand)}
                      className="p-2 bg-indigo-50 hover:bg-indigo-150 text-indigo-600 rounded-xl transition cursor-pointer"
                      title="Anexar à Lista de Compras"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="pt-2">
            <div className="p-3 bg-pink-100/50 rounded-2xl border border-pink-200/20 text-center text-[10px] text-pink-700 font-semibold">
              🎁 🐈 Adicione sachês ou vermífugos para as gatas ficarem sempre protegidas e saudáveis!
            </div>
          </div>
        </div>

      </div>

      {/* Floating Individual Cat Medical Chart Modal - Opens when selectedCat is set */}
      {selectedCat && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto animate-scale-in text-slate-800">
            <button
              onClick={handleCloseCatModal}
              className="absolute top-5 right-5 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition cursor-pointer"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-6">
              
              {/* Header profile info inside health file */}
              <div className="flex items-center gap-4 border-b border-pink-100 pb-4">
                <div className="w-14 h-14 bg-pink-100 text-pink-600 bg-cover bg-center rounded-2xl flex items-center justify-center font-black text-2xl border border-pink-200 shadow-sm" style={selectedCat.photoUrl ? { backgroundImage: `url(${selectedCat.photoUrl})` } : undefined}>
                  {!selectedCat.photoUrl && '🐱'}
                </div>
                <div>
                  <h3 className="text-xl font-sans font-black text-slate-900">PRONTUÁRIO DE SAÚDE: {selectedCat.name.toUpperCase()} 🩺</h3>
                  <p className="text-xs text-[#64748B] font-bold">Ficha individual acumulada de vacinas oficiais e pesagens constantes.</p>
                </div>
              </div>

              {/* SECTION A: VACCINES TABLE & INLINE ADDER */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2.5xl border border-slate-150">
                <h4 className="text-xs font-black uppercase text-indigo-900 tracking-wider flex items-center gap-1">
                  <Syringe className="w-4 h-4 text-emerald-500" />
                  Vacinas e Imunizações Aplicadas
                </h4>

                {/* Vaccine Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!vacName.trim() || !vacDate) return;
                    addCatVaccine(selectedCat.id, vacName.trim(), vacDate, vacNextDate);
                    
                    // refresh local pointer
                    const updCat = state.cats?.find(c => c.id === selectedCat.id);
                    if (updCat) {
                      setSelectedCat({
                        ...updCat,
                        vaccines: [...updCat.vaccines, { id: `vac-${Date.now()}`, name: vacName.trim(), appliedDate: vacDate, nextDoseDate: vacNextDate }]
                      });
                    }
                    
                    setVacName('');
                    setVacNextDate('');
                  }}
                  className="bg-white p-3.5 rounded-2xl border border-slate-200/50 space-y-3"
                >
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Lançar Nova Vacina</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input
                      type="text"
                      required
                      placeholder="Nome da Vacina (Ex: Tríplice F3)"
                      value={vacName}
                      onChange={(e) => setVacName(e.target.value)}
                      className="p-2 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                    <input
                      type="date"
                      required
                      title="Data de Aplicação"
                      value={vacDate}
                      onChange={(e) => setVacDate(e.target.value)}
                      className="p-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700"
                    />
                    <input
                      type="date"
                      placeholder="Próxima dose"
                      title="Data da Próxima Dose"
                      value={vacNextDate}
                      onChange={(e) => setVacNextDate(e.target.value)}
                      className="p-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      Salvar Registro Vacinal
                    </button>
                  </div>
                </form>

                {/* Vaccines records list */}
                <div className="space-y-2 mt-2">
                  {selectedCat.vaccines?.map(vac => (
                    <div key={vac.id} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800">
                      <div>
                        <p className="font-extrabold">{vac.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Aplicada em {vac.appliedDate}</p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {vac.nextDoseDate && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono font-bold px-2 py-0.5 rounded-md">
                            Reforço: {vac.nextDoseDate}
                          </span>
                        )}
                        <button
                          onClick={() => {
                            deleteCatVaccine(selectedCat.id, vac.id);
                            setSelectedCat(prev => prev ? { ...prev, vaccines: prev.vaccines.filter(v => v.id !== vac.id) } : null);
                          }}
                          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {selectedCat.vaccines?.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-2">Sem registro de imunizações salvas.</p>
                  )}
                </div>
              </div>

              {/* SECTION B: VET CONSULTATIONS & WEIGHT TRACKER */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2.5xl border border-slate-150">
                <h4 className="text-xs font-black uppercase text-indigo-900 tracking-wider flex items-center gap-1">
                  <Scale className="w-4 h-4 text-amber-500" />
                  Evolução de Peso e Clínico Veterinário
                </h4>

                {/* Consultation Form state layout */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const wt = parseFloat(vetWeight);
                    if (isNaN(wt) || !vetReason.trim()) return;
                    const costNum = vetCost ? parseFloat(vetCost) : undefined;
                    
                    addCatVetRecord(selectedCat.id, vetDate, wt, vetReason.trim(), costNum);
                    
                    // update local modal view pointer
                    const updCat = state.cats?.find(c => c.id === selectedCat.id);
                    if (updCat) {
                      setSelectedCat({
                        ...updCat,
                        vetRecords: [{ id: `vet-${Date.now()}`, date: vetDate, weight: wt, reason: vetReason.trim(), cost: costNum }, ...updCat.vetRecords]
                      });
                    }
                    
                    setVetWeight('');
                    setVetReason('');
                    setVetCost('');
                  }}
                  className="bg-white p-3.5 rounded-2xl border border-slate-200/50 space-y-3"
                >
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Lançar Consulta / Pesagem</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="date"
                      required
                      title="Data do Atendimento / Consulta"
                      value={vetDate}
                      onChange={(e) => setVetDate(e.target.value)}
                      className="p-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700"
                    />
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="Peso medido (Ex: 4.10, em kg)"
                      value={vetWeight}
                      onChange={(e) => setVetWeight(e.target.value)}
                      className="p-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Motivo / Diagnóstico Clínico"
                      value={vetReason}
                      onChange={(e) => setVetReason(e.target.value)}
                      className="p-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none sm:col-span-2"
                    />
                    <input
                      type="number"
                      placeholder="Custo do Atendimento (R$ Opcional)"
                      value={vetCost}
                      onChange={(e) => setVetCost(e.target.value)}
                      className="p-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      Gravar Consulta Médico-Veterinária
                    </button>
                  </div>
                </form>

                {/* Consultation records list */}
                <div className="space-y-2 mt-2">
                  {selectedCat.vetRecords?.map(rec => (
                    <div key={rec.id} className="bg-white p-3 rounded-xl border border-slate-250/60 text-xs flex justify-between items-start gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-800">{rec.reason}</span>
                          <span className="px-1.5 py-0.5 bg-yellow-50 text-amber-700 border border-yellow-200 rounded-md font-mono text-[9px] font-bold">
                            {rec.weight} kg
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">Atendimento em {rec.date}</p>
                        {rec.cost && rec.cost > 0 && (
                          <p className="text-[10.5px] text-emerald-700 font-bold flex items-center">
                            <DollarSign className="w-3.5 h-3.5" />
                            Gasto: R$ {rec.cost.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          deleteCatVetRecord(selectedCat.id, rec.id);
                          setSelectedCat(prev => prev ? { ...prev, vetRecords: prev.vetRecords.filter(r => r.id !== rec.id) } : null);
                        }}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition shrink-0"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {selectedCat.vetRecords?.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-2">Sem histórico clínico de acompanhamento.</p>
                  )}
                </div>
              </div>

              {/* Footer Close Actions */}
              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={handleCloseCatModal}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-2xl cursor-pointer"
                >
                  Concluir Prontuário Clínico 👍
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
