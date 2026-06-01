import React, { useState } from 'react';
import { PurchaseItem, PurchaseCategory, PurchaseHistoryMonth } from '../types';
import { 
  Plus, Trash2, Edit2, Check, ShoppingCart, Smartphone, History, 
  ArrowUp, ArrowDown, X, AlertTriangle, Sparkles, CheckCircle, 
  Layers, LogOut, CheckCircle2, ChevronRight, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShoppingViewProps {
  purchases: PurchaseItem[];
  purchaseHistory: PurchaseHistoryMonth[];
  currentPurchaseMonth: string;
  purchaseCorridorOrder: string[];
  purchasePriceRadar: { [itemName: string]: number[] };
  addPurchaseItem: (item: Omit<PurchaseItem, 'id' | 'purchased'>) => void;
  updatePurchaseItem: (id: string, updatedFields: Partial<PurchaseItem>) => void;
  togglePurchaseItem: (id: string) => void;
  deletePurchaseItem: (id: string) => void;
  archiveCurrentList: () => void;
  duplicateMonthList: (monthId: string) => void;
  updateCorridorOrder: (order: string[]) => void;
  isMercadoMode?: boolean;
  setIsMercadoMode?: (val: boolean) => void;
}

export default function ShoppingView({
  purchases, purchaseHistory, currentPurchaseMonth, purchaseCorridorOrder, purchasePriceRadar,
  addPurchaseItem, updatePurchaseItem, togglePurchaseItem, deletePurchaseItem,
  archiveCurrentList, duplicateMonthList, updateCorridorOrder,
  isMercadoMode: isMercadoModeProp,
  setIsMercadoMode: setIsMercadoModeProp
}: ShoppingViewProps) {
  
  // Modals / layouts toggles
  const [localMercadoMode, setLocalMercadoMode] = useState(false);
  const isMercadoMode = isMercadoModeProp !== undefined ? isMercadoModeProp : localMercadoMode;
  const setIsMercadoMode = setIsMercadoModeProp || setLocalMercadoMode;

  const [showHistory, setShowHistory] = useState(false);
  const [showCorridorConfig, setShowCorridorConfig] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PurchaseCategory>('mercearia');
  const [quantity, setQuantity] = useState(1);

  // Inline edit state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<PurchaseCategory>('mercearia');
  const [editQuantity, setEditQuantity] = useState(1);
  const [editUnitPrice, setEditUnitPrice] = useState(0);

  // Validation alerts & Feedback notifications
  const [alertedItemId, setAlertedItemId] = useState<string | null>(null);
  const [mercadoFeedback, setMercadoFeedback] = useState<string | null>(null);

  // --- NEW STATES (Market Usability Critiques) ---
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickCategory, setQuickCategory] = useState<PurchaseCategory>('mercearia');
  const [quickQty, setQuickQty] = useState(1);
  const [quickPrice, setQuickPrice] = useState(0);

  const [showClosePurchaseSummary, setShowClosePurchaseSummary] = useState(false);

  // Helper pricing algorithms & Historical Lookup
  const getLastPurchasePrice = (itemName: string): number | null => {
    // 1. Search chronological history
    for (let i = 0; i < purchaseHistory.length; i++) {
      const matchItem = purchaseHistory[i].items.find(
        it => it.name.toLowerCase().trim() === itemName.toLowerCase().trim() && it.unitPrice > 0
      );
      if (matchItem) {
        return matchItem.unitPrice;
      }
    }
    // 2. Fallback to latest price radar registry
    const historical = purchasePriceRadar[itemName] || [];
    if (historical.length > 0) {
      return historical[historical.length - 1];
    }
    return null;
  };

  const getItemPriceRadarInfo = (itemName: string, currentPrice: number) => {
    const lastPrice = getLastPurchasePrice(itemName);
    if (lastPrice === null) return { avg: 0, isAboveAverage: false, diffPercent: 0 };
    return {
      avg: lastPrice,
      isAboveAverage: currentPrice > lastPrice && lastPrice > 0,
      diffPercent: lastPrice > 0 ? ((currentPrice - lastPrice) / lastPrice) * 100 : 0
    };
  };

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addPurchaseItem({
      name: name.trim(),
      category,
      quantity,
      unitPrice: 0 // Free/zero in initial list adding
    });

    setName('');
    setQuantity(1);
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;

    addPurchaseItem({
      name: quickName.trim(),
      category: quickCategory,
      quantity: quickQty,
      unitPrice: quickPrice
    });

    setQuickName('');
    setQuickQty(1);
    setQuickPrice(0);
    setShowQuickAdd(false);

    setMercadoFeedback(`✨ "${quickName.trim()}" adicionado!`);
    setTimeout(() => setMercadoFeedback(null), 2500);
  };

  const startEditItem = (item: PurchaseItem) => {
    setEditingItemId(item.id);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditQuantity(item.quantity);
    setEditUnitPrice(item.unitPrice);
  };

  const saveEditItem = (id: string) => {
    if (!editName.trim()) return;
    updatePurchaseItem(id, {
      name: editName.trim(),
      category: editCategory,
      quantity: editQuantity,
      unitPrice: editUnitPrice
    });
    setEditingItemId(null);
  };

  // Move corridor sequences
  const moveCorridor = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...purchaseCorridorOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    
    updateCorridorOrder(newOrder);
  };

  const handleToggleMarketItem = (item: PurchaseItem) => {
    // Validate: if product is unchecked but price is zero or negative, signal error
    if (!item.purchased && (!item.unitPrice || item.unitPrice <= 0)) {
      setAlertedItemId(item.id);
      setTimeout(() => setAlertedItemId(null), 1500);
      return;
    }

    const sameCategoryPending = purchases.filter(p => !p.purchased && p.category === item.category && p.id !== item.id);
    togglePurchaseItem(item.id);

    if (!item.purchased && sameCategoryPending.length === 0) {
      const formattedCat = item.category.charAt(0).toUpperCase() + item.category.slice(1);
      setMercadoFeedback(`🛒 Corredor ${formattedCat} finalizado! 🙌`);
      setTimeout(() => setMercadoFeedback(null), 2500);
    }
  };

  // Calculations
  const pendingItems = purchases.filter(p => !p.purchased);
  const purchasedItems = purchases.filter(p => p.purchased);

  const totalPurchasedGeral = purchasedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const totalEstimatedRemaining = pendingItems.reduce((sum, item) => {
    if (item.unitPrice && item.unitPrice > 0) {
      return sum + (item.quantity * item.unitPrice);
    }
    const lastPrice = getLastPurchasePrice(item.name);
    if (lastPrice !== null) {
      return sum + (item.quantity * lastPrice);
    }
    return sum;
  }, 0);

  const totalGeral = totalEstimatedRemaining + totalPurchasedGeral;

  const getCorridorGroupedPending = () => {
    const groups: { [cat: string]: PurchaseItem[] } = {};
    pendingItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });

    return purchaseCorridorOrder
      .map(cat => ({ category: cat as PurchaseCategory, items: groups[cat] || [] }))
      .filter(g => g.items.length > 0);
  };

  const handleCheckoutClose = () => {
    archiveCurrentList();
    setIsMercadoMode(false);
    setShowClosePurchaseSummary(false);
    alert("Compra salva e fechada com sucesso! O mês fiscal foi arquivado no seu histórico de consumo.");
  };

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '20px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.03)'
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Header Panel with custom actions */}
      {!isMercadoMode && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-[#2D253D] flex items-center gap-2">
              <span className="p-1 px-2.5 bg-pink-500 text-white rounded-lg text-lg">🛒</span>
              Lista de Compras — Ciclo {currentPurchaseMonth.split('-').reverse().join('/')}
            </h2>
            <p className="text-sm text-[#4B5563] font-semibold mt-0.5">
              Gerencie itens, compare preços com registros passados e execute no celular direto no mercado.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowCorridorConfig(!showCorridorConfig)}
              className="px-3 py-2 bg-white/80 border border-slate-200 text-[#4B5563] hover:bg-slate-50 text-xs font-bold rounded-xl transition cursor-pointer shadow-3xs"
            >
              Configurar Corredores
            </button>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 py-2 bg-white/80 border border-slate-200 text-[#4B5563] hover:bg-slate-50 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <History className="w-3.5 h-3.5" />
              {showHistory ? 'Esconder Histórico' : 'Histórico Mensal'}
            </button>

            <button
              onClick={() => setIsMercadoMode(!isMercadoMode)}
              className={`px-4 py-2 text-sm font-black rounded-xl transition flex items-center gap-2 cursor-pointer border ${
                isMercadoMode 
                  ? 'bg-rose-600 text-white border-rose-600 shadow-md' 
                  : 'bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-150 shadow-2xs'
              }`}
            >
              <Smartphone className="w-4 h-4 text-pink-650" />
              {isMercadoMode ? 'Sair do Modo Mercado' : 'Modo Mercado 📱'}
            </button>
          </div>
        </div>
      )}

      {/* Corridor configuration dialog details */}
      <AnimatePresence>
        {showCorridorConfig && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={glassStyle}
            className="p-5 space-y-3"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-[#2D253D]">Sequência dos Corredores do Supermercado</h3>
                <p className="text-xs text-[#4B5563] font-medium">Reordene os setores abaixo para bater com a entrada e saída do seu supermercado favorito.</p>
              </div>
              <button onClick={() => setShowCorridorConfig(false)} className="text-gray-400 hover:text-[#2D253D] cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-2">
              {purchaseCorridorOrder.map((cat, index) => (
                <div key={cat} className="p-2 bg-white rounded-xl border border-slate-200 flex flex-col justify-between items-center text-center">
                  <span className="text-xs font-black text-[#2D253D] capitalize mb-2">{cat}</span>
                  <div className="flex gap-1">
                    <button 
                      type="button" 
                      disabled={index === 0}
                      onClick={() => moveCorridor(index, 'up')}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-205 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3 h-3 text-slate-500" />
                    </button>
                    <button 
                      type="button" 
                      disabled={index === purchaseCorridorOrder.length - 1}
                      onClick={() => moveCorridor(index, 'down')}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-205 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3 h-3 text-slate-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Floating Action feedback notices */}
      <AnimatePresence>
        {mercadoFeedback && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-6 right-6 p-4 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl flex items-center gap-3 z-50 font-bold text-sm"
          >
            <CheckCircle className="w-5 h-5 text-emerald-450 animate-bounce" />
            <span>{mercadoFeedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History view and list cloning */}
      {showHistory && (
        <div style={glassStyle} className="p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-sans font-black text-md text-[#2D253D] flex items-center gap-2">
              <History className="w-5 h-5 text-pink-500" />
              Histórico de Listas Arquivadas
            </h3>
            <button
              onClick={() => {
                if (confirm('Arquivar a lista atual? Os itens comprados serão armazenados e os pendentes serão repassados para a nova lista.')) {
                  archiveCurrentList();
                  alert("Lista arquivada!");
                }
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Arquivar Mês Atual 🗳️
            </button>
          </div>

          {purchaseHistory.length === 0 ? (
            <p className="text-xs text-[#4B5563] italic font-semibold">Nenhum mês arquivado ainda no sistema.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {purchaseHistory.map(hist => (
                <div key={hist.id} className="bg-white p-4 rounded-xl border border-slate-200/65 flex justify-between items-center shadow-3xs">
                  <div>
                    <h4 className="font-bold text-sm text-[#2D253D]">{hist.monthLabel}</h4>
                    <p className="text-xs text-emerald-700 font-extrabold mt-0.5">Gasto Total: R$ {hist.totalGasto.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{hist.items.length} itens cadastrados</p>
                  </div>
                  <button
                    onClick={() => {
                      duplicateMonthList(hist.id);
                      alert(`Lista de ${hist.monthLabel} duplicada!`);
                    }}
                    className="px-3.5 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer transition"
                  >
                    Clonar Lista
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RENDER MODE SPLITTER */}
      {!isMercadoMode ? (
        
        // STANDARD LAYOUT MODE
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Add item Panel Form */}
          <div style={glassStyle} className="lg:col-span-1 p-5 space-y-4 self-start">
            <h3 className="font-sans font-black text-md text-[#2D253D] flex items-center gap-2">
              <Plus className="w-5 h-5 text-pink-500" />
              Lançar Produto na Lista
            </h3>

            <form onSubmit={handleAddItemSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-[#4B5563] uppercase tracking-widest font-mono">Nome do Produto</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Café Tradicional Vácuo Bag"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:border-pink-500 transition shadow-3xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-[#4B5563] uppercase tracking-widest font-mono">Quantidade</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quantity}
                  onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:border-pink-500 transition shadow-3xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-[#4B5563] uppercase tracking-widest font-mono">Corredor</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as PurchaseCategory)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:border-pink-500 cursor-pointer shadow-3xs text-[#2D253D]"
                >
                  <option value="hortifruti">Hortifruti 🥬</option>
                  <option value="frios">Frios & Congelados  Cheese</option>
                  <option value="mercearia">Mercearia 🍞</option>
                  <option value="bebidas">Bebidas 🥤</option>
                  <option value="higiene">Higiene 🧴</option>
                  <option value="limpeza">Limpeza 🧼</option>
                  <option value="outros">Outros 📦</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md cursor-pointer"
              >
                Adicionar Produto
              </button>
            </form>

            <div className="p-4 bg-white/60 text-xs rounded-xl space-y-2 border border-white/80">
              <span className="font-extrabold text-[#4B5563] flex items-center gap-1 uppercase font-mono tracking-widest">
                <Layers className="w-3.5 h-3.5 text-pink-500" /> RESUMO FINANCEIRO ESTIMADO:
              </span>
              <div className="flex justify-between font-mono text-[#4B5563] font-bold">
                <span>No Carrinho:</span><span>R$ {totalPurchasedGeral.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-mono text-[#4B5563] font-bold">
                <span>Prateleira (Estimado):</span><span>R$ {totalEstimatedRemaining.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-mono text-[#2D253D] font-black border-t border-dashed border-slate-200 pt-1.5 text-xs">
                <span>Total Calculado:</span><span>R$ {totalGeral.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* List items columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Products pending list */}
            <div style={glassStyle} className="p-5">
              <h3 className="font-sans font-black text-md text-[#2D253D] flex items-center justify-between mb-4 border-b border-slate-100/60 pb-2">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-pink-500" />
                  Prateleira Pendente ({pendingItems.length})
                </span>
                <span className="text-xs font-mono font-black text-pink-600 bg-pink-50 px-2 py-1 rounded">
                  Estimados: R$ {totalEstimatedRemaining.toFixed(2)}
                </span>
              </h3>

              {pendingItems.length === 0 ? (
                <div className="text-center py-10 text-[#4B5563] font-extrabold text-xs">
                  ✨ Nenhum item pendente de mercado! Bom proveito.
                </div>
              ) : (
                <div className="divide-y divide-slate-100/60">
                  {pendingItems.map(item => {
                    const isEditing = editingItemId === item.id;
                    const pricing = getItemPriceRadarInfo(item.name, item.unitPrice);

                    return (
                      <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                        {isEditing ? (
                          <div className="flex flex-wrap items-center gap-2 w-full bg-slate-50 p-3 rounded-xl border border-slate-200">
                             <input
                              type="text"
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg shrink-0 w-32 font-bold outline-none text-[#2D253D]"
                            />
                            <input
                              type="number"
                              value={editQuantity}
                              onChange={e => setEditQuantity(parseInt(e.target.value) || 1)}
                              className="px-1 py-1 text-xs bg-white border border-slate-200 rounded-lg w-12 text-center text-[#2D253D] font-bold"
                            />
                            <input
                              type="number"
                              step="0.01"
                              value={editUnitPrice}
                              onChange={e => setEditUnitPrice(parseFloat(e.target.value) || 0)}
                              className="px-1 py-1 text-xs bg-white border border-slate-200 rounded-lg w-16 text-center font-mono font-bold focus:border-pink-500 outline-none text-[#2D253D]"
                            />
                            <select
                              value={editCategory}
                              onChange={e => setEditCategory(e.target.value as any)}
                              className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg cursor-pointer text-[#2D253D] font-bold"
                            >
                              <option value="hortifruti">Hortifruti</option>
                              <option value="frios">Frios</option>
                              <option value="mercearia">Mercearia</option>
                              <option value="bebidas">Bebidas</option>
                              <option value="higiene">Higiene</option>
                              <option value="limpeza">Limpeza</option>
                              <option value="outros">Outros</option>
                            </select>

                            <button onClick={() => saveEditItem(item.id)} className="p-1 px-2.5 text-[10px] bg-pink-550 font-bold text-white rounded-md cursor-pointer">Salvar</button>
                            <button onClick={() => setEditingItemId(null)} className="p-1 px-2.5 text-[10px] bg-slate-200 text-[#4B5563] rounded-md cursor-pointer">Voltar</button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleToggleMarketItem(item)}
                                className="w-5.5 h-5.5 border-2 border-slate-300 rounded-full hover:border-pink-500 flex items-center justify-center cursor-pointer bg-white"
                              >
                                <span className="w-2.5 h-2.5 rounded-full hover:bg-pink-500 transition-colors" />
                              </button>
                              
                              <div>
                                <span className="text-sm font-extrabold text-[#2D253D]">{item.name}</span>
                                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-slate-100 text-[#4B5563] rounded font-bold capitalize">
                                    {item.category}
                                  </span>
                                  {item.unitPrice > 0 ? (
                                    <span className="text-xs text-pink-650 bg-pink-50 border border-pink-100 px-2 py-0.5 rounded font-bold font-mono">
                                      {item.quantity} un x R$ {item.unitPrice.toFixed(2)} = R$ {(item.quantity * item.unitPrice).toFixed(2)}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-[#4B5563] font-bold font-mono">
                                      Quant: {item.quantity}
                                    </span>
                                  )}

                                  {item.unitPrice > 0 && pricing.isAboveAverage && (
                                    <span className="text-[10px] bg-red-50 text-red-650 border border-red-200 font-extrabold px-1.5 py-0.2 rounded"
                                          title={`Último valor registrado: R$ ${pricing.avg.toFixed(2)}`}>
                                      ⚠️ Caro (Último: R$ {pricing.avg.toFixed(2)})!
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {item.unitPrice > 0 && (
                                <span className="text-sm font-black font-mono text-[#2D253D] mr-3">
                                  R$ {(item.quantity * item.unitPrice).toFixed(2)}
                                </span>
                              )}
                              <button onClick={() => startEditItem(item)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 cursor-pointer">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deletePurchaseItem(item.id)} className="p-1 hover:bg-rose-55 text-rose-500 rounded cursor-pointer">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Completed purchases items list */}
            <div style={glassStyle} className="p-5">
              <h3 className="font-sans font-black text-md text-[#2D253D] flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  No Carrinho ({purchasedItems.length})
                </span>
                <span className="text-xs font-mono font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  Gasto Parcial: R$ {totalPurchasedGeral.toFixed(2)}
                </span>
              </h3>

              {purchasedItems.length === 0 ? (
                <p className="text-xs text-[#4B5563] font-semibold py-2 italic text-center">Bipe ou marque itens comprados no supermercado para acumular o carrinho!</p>
              ) : (
                <div className="divide-y divide-slate-100/65">
                  {purchasedItems.map(item => (
                    <div key={item.id} className="py-2 flex items-center justify-between text-xs opacity-75">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => togglePurchaseItem(item.id)}
                          className="w-5.5 h-5.5 bg-emerald-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[4px]" />
                        </button>
                        <div>
                          <span className="font-bold line-through text-[#4B5563] block text-sm">{item.name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-slate-100 text-[#4B5563] rounded font-bold capitalize">
                              {item.category}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono font-bold">
                              {item.quantity} un x R$ {item.unitPrice.toFixed(2)} = R$ {(item.quantity * item.unitPrice).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#4B5563] font-bold line-through mr-3">
                          R$ {(item.quantity * item.unitPrice).toFixed(2)}
                        </span>
                        <button onClick={() => deletePurchaseItem(item.id)} className="p-1 hover:bg-rose-50 text-rose-500 rounded cursor-pointer">
                          <Trash2 className="w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      ) : (
        
        // ==========================================
        // 🚨 2. MODE MERCADO: UPGRADED MOBILE GONDOLA USABILITY LAYOUT
        // ==========================================
        <div style={glassStyle} className="max-w-md mx-auto p-3 sm:p-5 relative space-y-4 sm:space-y-6 min-h-[400px]">
          
          {/* Ultra-compact Top Bar for Mobile/Tablet */}
          <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 py-2 px-3 -mx-3 -mt-3 mb-2 flex items-center justify-between sm:-mx-5 sm:-mt-5">
            <div className="flex items-center gap-1.5 truncate">
              <button 
                onClick={() => setIsMercadoMode(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition shrink-0"
                title="Voltar ao modo clássico"
              >
                <LogOut className="w-4 h-4 rotate-180" />
              </button>
              <h3 className="font-sans font-black text-xs sm:text-sm text-[#2D253D] tracking-tight truncate">
                Mercado — {currentPurchaseMonth.split('-').reverse().join('/')}
              </h3>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Configurar Corredores */}
              <button
                onClick={() => setShowCorridorConfig(!showCorridorConfig)}
                className={`p-1.5 rounded-lg transition ${
                  showCorridorConfig ? 'bg-pink-100 text-pink-600' : 'text-slate-500 hover:bg-slate-100'
                }`}
                title="Corredores"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>

              {/* Histórico */}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-1.5 rounded-lg transition ${
                  showHistory ? 'bg-pink-100 text-pink-600' : 'text-slate-500 hover:bg-slate-100'
                }`}
                title="Histórico"
              >
                <History className="w-3.5 h-3.5" />
              </button>

              {/* Float quick add */}
              <button
                onClick={() => setShowQuickAdd(true)}
                className="p-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition flex items-center justify-center shadow-xs"
                title="Novo Item"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="hidden sm:block text-center bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100 text-[11px] text-indigo-850 font-medium">
            💡 <b>Gesto de Exclusão:</b> Para excluir, arraste o item para a esquerda ou use os botões de controle de volume!
          </div>

          <div className="space-y-3 sm:space-y-4">
            {getCorridorGroupedPending().length === 0 ? (
              <div className="text-center py-12 bg-emerald-50/40 p-4 border border-emerald-100 rounded-2xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
                <p className="font-sans font-black text-emerald-900 mt-2 text-sm uppercase">Todos Corredores Limpos! 🎉</p>
                <p className="text-xs text-emerald-700/80 mt-1">Nenhum item pendente restante. Clique no botão de fechamento abaixo!</p>
              </div>
            ) : (
              getCorridorGroupedPending().map(group => {
                const formattedCat = group.category.charAt(0).toUpperCase() + group.category.slice(1);
                
                return (
                  <div key={group.category} className="space-y-1.5 sm:space-y-3 bg-white/40 p-2 sm:p-3.5 rounded-xl sm:rounded-2.5xl border border-white shadow-3xs">
                    
                    {/* Corridor Ribbon Header */}
                    <h4 className="text-[9px] sm:text-[10px] uppercase font-mono font-black tracking-widest text-[#2D253D] bg-pink-100/50 px-2 py-0.5 rounded-lg inline-block">
                      {formattedCat === 'Mercearia' ? 'Mercearia 🍞' : 
                       formattedCat === 'Hortifruti' ? 'Hortifruti 🥬' :
                       formattedCat === 'Bebidas' ? 'Bebidas 🥤' :
                       formattedCat === 'Frios' ? 'Frios & Congelados  Cheese' :
                       formattedCat === 'Higiene' ? 'Higiene 🧴' :
                       formattedCat === 'Limpeza' ? 'Limpeza 🧼' : `${formattedCat} m`}
                    </h4>
                    
                    {/* Swipable Pending Items block with embedded counters & price comparisons */}
                    <div className="space-y-1.5 sm:space-y-2.5">
                      {group.items.map((item) => {
                        const lastPrice = getLastPurchasePrice(item.name);
                        const isUnderRadar = lastPrice !== null && (item.unitPrice || 0) > lastPrice;
                        
                        return (
                          <div key={item.id} className="relative overflow-hidden rounded-xl">
                            
                            {/* Sliding under-layer representing trash background */}
                            <div className="absolute inset-0 bg-red-650 flex items-center justify-end px-5 text-white font-black text-xs">
                              <span>Excluir Item 🗑️</span>
                            </div>

                            {/* Main swipable card block */}
                            <motion.div
                              drag="x"
                              dragDirectionLock
                              dragConstraints={{ left: -100, right: 0 }}
                              dragElastic={{ left: 0.15, right: 0 }}
                              onDragEnd={(e, info) => {
                                if (info.offset.x < -60) {
                                  deletePurchaseItem(item.id);
                                }
                              }}
                              className="relative bg-white/95 p-1.5 sm:p-3 flex items-center justify-between gap-1.5 sm:gap-2.5 rounded-xl border border-slate-100/50 scroll-py-8"
                            >
                              
                              {/* Left column check triggers */}
                              <div className="flex items-center gap-2 truncate w-full">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleMarketItem(item);
                                  }}
                                  className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 border-2 border-slate-300 rounded-full flex items-center justify-center bg-white shadow-xs hover:border-pink-550 transition-colors shrink-0 cursor-pointer"
                                  title="Marcar como Comprado"
                                >
                                  <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full hover:bg-pink-500 bg-slate-100" />
                                </button>
                                
                                <div className="truncate pr-1">
                                  <span className="text-[11px] sm:text-xs font-black text-[#2D253D] block leading-tight truncate">{item.name}</span>
                                  
                                  {/* Direct Touch Interactive Quantity Counter Controls */}
                                  <div className="flex items-center gap-1 mt-0.5 select-none">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (item.quantity > 1) {
                                          updatePurchaseItem(item.id, { quantity: item.quantity - 1 });
                                        } else {
                                          if (confirm(`Excluir "${item.name}"?`)) {
                                            deletePurchaseItem(item.id);
                                          }
                                        }
                                      }}
                                      className="w-4 h-4 bg-slate-100 hover:bg-slate-205 text-slate-800 flex items-center justify-center rounded font-black text-[10px] cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <span className="text-[10px] font-bold font-mono text-slate-700 px-0.5">{item.quantity}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updatePurchaseItem(item.id, { quantity: item.quantity + 1 });
                                      }}
                                      className="w-4 h-4 bg-slate-100 hover:bg-slate-205 text-slate-800 flex items-center justify-center rounded font-black text-[10px] cursor-pointer"
                                    >
                                      +
                                    </button>
                                    
                                    {item.unitPrice > 0 && (
                                      <span className="text-[9px] text-slate-450 font-mono">
                                        = R$ {(item.quantity * item.unitPrice).toFixed(2)}
                                      </span>
                                    )}
                                  </div>

                                  {/* Last historic valuation comparator alerts */}
                                  {lastPrice !== null && (
                                    <span className={`text-[8px] block mt-0.5 font-bold ${
                                      isUnderRadar ? 'text-orange-605 font-black uppercase tracking-wider' : 'text-slate-400'
                                    }`}>
                                      {isUnderRadar ? '🔺 Caro' : '✓ Ant'}: R$ {lastPrice.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Real-time price entry (Natively triggers mobile decimal numpad keyboard) */}
                              <div className="shrink-0 text-right">
                                <div className={`flex items-center gap-0.5 border px-1 py-0.5 sm:px-1.5 sm:py-1 rounded-lg ${
                                  isUnderRadar 
                                    ? 'bg-orange-50 border-orange-300 ring-1 ring-orange-200' 
                                    : 'bg-white border-slate-200'
                                }`}>
                                  <span className="text-[8px] sm:text-[10px] font-mono text-slate-400 font-bold">R$</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0,00"
                                    inputMode="decimal"
                                    value={item.unitPrice || ''}
                                    onChange={(e) => {
                                      let val = parseFloat(e.target.value);
                                      if (isNaN(val) || val < 0) val = 0;
                                      updatePurchaseItem(item.id, { unitPrice: val });
                                    }}
                                    className={`w-10 sm:w-14 bg-transparent text-[11px] sm:text-xs font-mono font-black text-center focus:outline-none focus:ring-0 ${
                                      isUnderRadar ? 'text-orange-900 border-none' : 'text-slate-800 border-none'
                                    }`}
                                  />
                                </div>
                              </div>

                            </motion.div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* Sticky Bottom Bar for mobile / standard container footer for desktop */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2 text-[#2D253D] z-30 -mx-3 -mb-3 sm:-mx-5 sm:-mb-5 mt-4 flex justify-between items-center bg-white shadow-lg rounded-b-2xl">
            <div className="text-left shrink-0">
              <span className="text-[8px] text-slate-400 font-extrabold uppercase font-mono block">No Carrinho</span>
              <span className="font-mono text-emerald-600 font-black text-xs sm:text-sm">R$ {totalPurchasedGeral.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMercadoMode(false)}
                className="px-2.5 py-1.5 border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-105 font-black text-[9px] uppercase tracking-wider transition rounded-lg"
              >
                Sair
              </button>
              <button
                onClick={() => setShowClosePurchaseSummary(true)}
                className="px-2.5 py-1.5 bg-rose-650 text-white hover:bg-rose-700 font-black text-[9px] uppercase tracking-wider transition shadow-sm rounded-lg flex items-center gap-1"
              >
                <Check className="w-3 h-3 stroke-[3px]" />
                Fechar Compra
              </button>
            </div>
          </div>

        </div>
      )}

      {/* FLOATING ACTION BUTTON (FAB) FOR QUICK ADDS INSIDE MODO MERCADO */}
      {isMercadoMode && !showQuickAdd && (
        <button
          onClick={() => setShowQuickAdd(true)}
          className="fixed bottom-24 right-5 w-14 h-14 bg-pink-500 hover:bg-pink-600 hover:scale-105 active:scale-95 transition-all text-white rounded-full flex items-center justify-center shadow-2xl z-40 cursor-pointer"
          title="Inserir produto extra de última hora"
        >
          <Plus className="w-6 h-6 stroke-[3px]" />
        </button>
      )}

      {/* QUICK ADD DRAWER OVERLAY POPUP */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 animate-slide-up space-y-4 text-slate-800">
            <div className="flex justify-between items-center pb-2 border-b">
              <h4 className="font-sans font-black text-sm text-[#2D253D] uppercase tracking-wide">Produto Extra Instantâneo 🥫</h4>
              <button onClick={() => setShowQuickAdd(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleQuickAddSubmit} className="space-y-3.5">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-450 block mb-1">Nome do Produto</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Chocolate Meio Amargo Barra"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:border-pink-500 outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-450 block mb-1">Qtd</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quickQty}
                    onChange={(e) => setQuickQty(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-450 block mb-1">Preço Gôndola (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    inputMode="decimal"
                    value={quickPrice || ''}
                    onChange={(e) => setQuickPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-center font-mono font-black"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-slate-450 block mb-1">Setor / Corredor</label>
                <select
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-800"
                >
                  <option value="hortifruti">Hortifruti 🥬</option>
                  <option value="frios">Frios & Congelados 🧀</option>
                  <option value="mercearia">Mercearia 🍞</option>
                  <option value="bebidas">Bebidas 🥤</option>
                  <option value="higiene">Higiene 🧴</option>
                  <option value="limpeza">Limpeza 🧼</option>
                  <option value="outros">Outros 📦</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors"
              >
                Anexar ao Carrinho Agora ⚡
              </button>
            </form>
          </div>
        </div>
      )}

      {/* IN-DEPTH CHECKOUT FINAL PURCHASE SUMMARY MODAL */}
      {showClosePurchaseSummary && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 max-w-lg w-full shadow-2xl relative max-h-[85vh] overflow-y-auto animate-scale-in text-slate-800">
            <button
              onClick={() => setShowClosePurchaseSummary(false)}
              className="absolute top-5 right-5 p-2 bg-slate-105 hover:bg-slate-200 text-slate-500 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-5">
              <div className="flex items-center gap-3 border-b pb-4 border-pink-100">
                <div className="p-3 bg-pink-100/80 text-pink-550 rounded-2xl">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-sans font-black text-slate-900">RESUMO FINAL DAS COMPRAS 🎉</h3>
                  <p className="text-xs text-slate-505 font-bold">Verifique o fechamento financeiro antes de encerrar seu mês fiscal.</p>
                </div>
              </div>

              {/* Shopping calculations statistics block */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border space-y-2.5">
                <div className="flex justify-between text-xs text-slate-600 font-bold">
                  <span>Total de Itens Adquiridos:</span>
                  <span className="font-mono text-slate-900">{purchasedItems.length} produtos</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 font-bold">
                  <span>Total de Itens Não Encontrados:</span>
                  <span className="font-mono text-slate-900">{pendingItems.length} pendentes</span>
                </div>
                <div className="flex justify-between text-base font-black text-[#2D253D] border-t border-dashed border-slate-200 pt-2.5">
                  <span>Valor de Fatura Liquidado:</span>
                  <span className="font-mono text-emerald-600 text-[18px]">R$ {totalPurchasedGeral.toFixed(2)}</span>
                </div>
              </div>

              {/* Explaining list roll-overs */}
              <div className="text-[11px] bg-indigo-50/45 p-3 rounded-xl border border-indigo-100 text-indigo-900 font-semibold space-y-1">
                <p className="font-bold flex items-center gap-1">📦 O que acontece agora?</p>
                <p className="text-indigo-800/85 font-medium leading-relaxed">
                  Os {purchasedItems.length} produtos do carrinho serão arquivados de forma limpa. Os {pendingItems.length} itens da prateleira que você não marcou como comprados serão levados sequencialmente para o próximo ciclo de compras, sem perdas!
                </p>
              </div>

              {/* Scrolling lists representation for review */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase text-slate-450 tracking-widest leading-none">Visualizar Fatura:</h4>
                <div className="max-h-36 overflow-y-auto border border-slate-200/50 rounded-xl p-2.5 space-y-2 divide-y divide-slate-100 bg-white">
                  {purchasedItems.map(item => (
                    <div key={item.id} className="flex justify-between text-xs pt-1.5 first:pt-0 font-bold text-slate-800">
                      <span>{item.name} ({item.quantity}u)</span>
                      <span className="font-mono text-slate-500">R$ {(item.quantity * item.unitPrice).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowClosePurchaseSummary(false)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider rounded-xl transition"
                >
                  Voltar e Ajustar
                </button>
                <button
                  type="button"
                  onClick={handleCheckoutClose}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1 shadow-md"
                >
                  Confirmar e Fechar! ✨
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
