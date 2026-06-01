/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PantryItem, PurchaseCategory } from '../types';
import { 
  Plus, Trash2, Edit2, AlertTriangle, Check, ShieldAlert, Package, 
  ShoppingCart, Filter, Star, MessageSquare, ThumbsUp, ThumbsDown
} from 'lucide-react';

interface PantryViewProps {
  pantry: PantryItem[];
  addPantryItem: (item: Omit<PantryItem, 'id'>) => void;
  updatePantryItem: (id: string, updatedFields: Partial<PantryItem>) => void;
  deletePantryItem: (id: string) => void;
  sendItemsBelowMinToShoppingList: () => void;
}

export default function PantryView({
  pantry, addPantryItem, updatePantryItem, deletePantryItem, sendItemsBelowMinToShoppingList
}: PantryViewProps) {
  
  // Forms & Filter states
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [name, setName] = useState('');
  const [category, setCategory] = useState('mercearia');
  const [quantity, setQuantity] = useState(1);
  const [minQuantity, setMinQuantity] = useState(1);

  // Lab modal / details
  const [editingLabItemId, setEditingLabItemId] = useState<string | null>(null);
  const [labRating, setLabRating] = useState<number>(5);
  const [labReview, setLabReview] = useState('');
  const [labBuyAgain, setLabBuyAgain] = useState<'sim' | 'não' | 'talvez'>('sim');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addPantryItem({
      name: name.trim(),
      category,
      quantity,
      minQuantity
    });

    setName('');
    setQuantity(1);
    setMinQuantity(1);
    setShowAddForm(false);
  };

  const startLabEditing = (item: PantryItem) => {
    setEditingLabItemId(item.id);
    setLabRating(item.rating || 5);
    setLabReview(item.review || '');
    setLabBuyAgain(item.buyAgain || 'sim');
  };

  const saveLabReview = (id: string) => {
    updatePantryItem(id, {
      rating: labRating,
      review: labReview.trim(),
      buyAgain: labBuyAgain
    });
    setEditingLabItemId(null);
  };

  // Calculations
  const lowStockItems = pantry.filter(item => item.quantity <= item.minQuantity);
  const filteredPantry = pantry.filter(item => {
    return filterCategory === 'all' || item.category === filterCategory;
  });

  const handleSendToShoppingList = () => {
    if (lowStockItems.length === 0) {
      alert('Nenhum item está abaixo do estoque mínimo cadastrado!');
      return;
    }
    sendItemsBelowMinToShoppingList();
    alert(`🛒 ${lowStockItems.length} itens em falta foram programados e enviados para a lista de compras do mês atual.`);
  };

  // Standard translucent CSS unique layout style inline template
  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '20px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.03)'
  };

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in">
      
      {/* Upper header action section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[#2D253D] flex items-center gap-2">
            <span className="p-1 px-2.5 bg-emerald-500 text-white rounded-lg text-lg">3</span>
            Despensa da Casa & Laboratório de Produtos
          </h2>
          <p className="text-sm text-[#4B5563] font-semibold">
            Gerencie o estoque doméstico, receba alertas visuais automáticos de itens escassos e construa um catálogo de avaliação pessoal de marcas e produtos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSendToShoppingList}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-sm rounded-xl border border-emerald-250 transition flex items-center gap-2 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-500" />
            Abastecer Lista de Compras ({lowStockItems.length})
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Adicionar Item
          </button>
        </div>
      </div>

      {/* Quick low stock highlight notice block */}
      {lowStockItems.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-250 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-yellow-905 text-[#2D253D]">
          <div className="flex items-start sm:items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="font-extrabold text-[#2D253D]">Alerta: Estoque Insuficiente ({lowStockItems.length} itens)</p>
              <p className="text-xs text-[#4B5563] font-semibold">Pelo menos {lowStockItems.length} mantimentos cruciais em sua despensa estão abaixo da quantidade mínima sugerida para a residência.</p>
            </div>
          </div>
          <button
            onClick={handleSendToShoppingList}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition whitespace-nowrap self-end cursor-pointer"
          >
            Adicionar Todos à Lista →
          </button>
        </div>
      )}

      {/* Add pantry item form drawer */}
      {showAddForm && (
        <form onSubmit={handleAddItem} style={glassStyle} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#4B5563] uppercase">Nome do Item</label>
              <input
                type="text"
                required
                placeholder="Ex: Azeite Extra Virgem Borges"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:border-emerald-500 transition text-[#2D253D] shadow-2xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#4B5563] uppercase">Categoria</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:border-emerald-500 cursor-pointer text-[#2D253D] shadow-2xs"
              >
                <option value="mercearia">Mercearia</option>
                <option value="frios">Frios & Conservas</option>
                <option value="hortifruti">Hortifruti</option>
                <option value="bebidas">Bebidas</option>
                <option value="higiene">Higiene</option>
                <option value="limpeza">Material de Limpeza</option>
                <option value="outros">Outros</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#4B5563] uppercase">Estoque Atual</label>
              <input
                type="number"
                step="0.1"
                min={0}
                required
                value={quantity}
                onChange={e => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:border-emerald-500 transition text-[#2D253D] shadow-2xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#4B5563] uppercase">Quantidade Mínima</label>
              <input
                type="number"
                step="0.1"
                min={0.1}
                required
                value={minQuantity}
                onChange={e => setMinQuantity(parseFloat(e.target.value) || 1)}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:border-emerald-500 transition text-[#2D253D] shadow-2xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition"
            >
              Registrar Item
            </button>
          </div>
        </form>
      )}

      {/* Sorting bar tag filters */}
      <div style={glassStyle} className="p-4 flex items-center gap-3">
        <Filter className="w-4 h-4 text-gray-450" />
        <span className="text-xs font-bold text-[#4B5563] uppercase">Filtrar Categoria:</span>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-2 py-1 bg-white border border-slate-200 text-xs rounded-lg outline-none font-semibold cursor-pointer text-[#2D253D] shadow-2xs"
        >
          <option value="all">Todas</option>
          <option value="mercearia">Mercearia</option>
          <option value="frios">Frios & Conservas</option>
          <option value="hortifruti">Hortifruti</option>
          <option value="bebidas">Bebidas</option>
          <option value="higiene">Higiene</option>
          <option value="limpeza">Material de Limpeza</option>
          <option value="outros">Outros</option>
        </select>
      </div>

      {/* Main Grid Inventory Displays */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPantry.map(item => {
          const isLowStock = item.quantity <= item.minQuantity;
          const isRatingEditing = editingLabItemId === item.id;

          return (
            <div 
              key={item.id}
              style={glassStyle}
              className={`p-5 transition-all flex flex-col justify-between ${
                isLowStock 
                  ? 'ring-2 ring-amber-400' 
                  : ''
              }`}
            >
              {/* Product Header details */}
              <div className="space-y-2 animate-fade-in">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-black text-md text-[#2D253D] capitalize">{item.name}</h3>
                    <span className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 bg-slate-100 font-bold text-slate-500 rounded-md capitalize">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    {isLowStock ? (
                      <span className="flex items-center gap-1 text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold font-mono">
                        <AlertTriangle className="w-3 h-3 text-amber-500" /> Baixo!
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-100 text-emerald-850 px-2 py-0.5 rounded-md font-bold font-mono">
                        Ok 👍
                      </span>
                    )}

                    <button
                      onClick={() => {
                        if (confirm('Deletar este mantimento da despensa?')) deletePantryItem(item.id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stock values indicators controls */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-center border-r border-slate-200">
                    <span className="text-[10px] text-[#4B5563] font-bold block font-mono">Estoque Real</span>
                    <div className="flex justify-center items-center gap-1 mt-1">
                      <button
                        onClick={() => updatePantryItem(item.id, { quantity: Math.max(0, item.quantity - 0.5) })}
                        className="px-2 py-0 text-xs bg-white border border-slate-205 hover:bg-slate-200 text-slate-700 rounded font-black cursor-pointer shadow-2xs"
                      >
                        -
                      </button>
                      <span className="text-sm font-black text-[#2D253D] font-mono">{item.quantity}</span>
                      <button
                        onClick={() => updatePantryItem(item.id, { quantity: item.quantity + 0.5 })}
                        className="px-2 py-0 text-xs bg-white border border-slate-205 hover:bg-slate-200 text-slate-700 rounded font-black cursor-pointer shadow-2xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] text-[#4B5563] font-bold block font-mono">Estoque Mínimo</span>
                    <div className="flex justify-center items-center gap-1 mt-1">
                      <button
                        onClick={() => updatePantryItem(item.id, { minQuantity: Math.max(0.1, item.minQuantity - 0.5) })}
                        className="px-2 py-0 text-xs bg-white border border-slate-205 hover:bg-slate-200 text-slate-700 rounded font-black cursor-pointer shadow-2xs"
                      >
                        -
                      </button>
                      <span className="text-sm font-black text-[#2D253D] font-mono">{item.minQuantity}</span>
                      <button
                        onClick={() => updatePantryItem(item.id, { minQuantity: item.minQuantity + 0.5 })}
                        className="px-2 py-0 text-xs bg-white border border-slate-205 hover:bg-slate-200 text-slate-700 rounded font-black cursor-pointer shadow-2xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* 2. Laboratório de Produtos (Quality evaluations) */}
              <div className="border-t border-slate-100 pt-3 mt-4 space-y-2">
                <span className="text-[10px] uppercase tracking-widest font-black text-pink-650 font-mono block">🔬 Laboratório de Produto</span>
                
                {isRatingEditing ? (
                  // Item audit card editor
                  <div className="space-y-3 bg-pink-50/40 p-3 rounded-xl border border-pink-100">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-[#4B5563] mr-1">Nota:</span>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} type="button" onClick={() => setLabRating(star)} className="text-yellow-500 cursor-pointer">
                          <Star className={`w-4 h-4 ${star <= labRating ? 'fill-yellow-500' : ''}`} />
                        </button>
                      ))}
                    </div>

                    <div className="space-y-1">
                      <textarea
                        value={labReview}
                        onChange={e => setLabReview(e.target.value)}
                        placeholder="Impressões sobre qualidade ou sabor..."
                        rows={2}
                        className="w-full px-2 py-1 bg-white border border-slate-200 text-xs rounded-lg text-[#2D253D] font-semibold outline-none focus:border-pink-500"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold text-[#4B5563]">
                      <span>Recompraria?</span>
                      <select
                        value={labBuyAgain}
                        onChange={e => setLabBuyAgain(e.target.value as any)}
                        className="px-2 py-0.5 bg-white border border-slate-200 rounded font-bold cursor-pointer text-[#2D253D]"
                      >
                        <option value="sim">Sim 👍</option>
                        <option value="não">Não 👎</option>
                        <option value="talvez">Talvez 🤔</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => setEditingLabItemId(null)} className="px-2 py-1 bg-white border text-slate-700 hover:bg-slate-100 rounded text-[10px] font-bold">Cancelar</button>
                      <button onClick={() => saveLabReview(item.id)} className="px-2.5 py-1 bg-pink-500 hover:bg-pink-600 text-white rounded text-[10px] font-black">Salvar</button>
                    </div>
                  </div>
                ) : (
                  // Display ratings
                  <div className="text-xs space-y-1">
                    {item.rating ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 text-yellow-500 ${i < item.rating! ? 'fill-yellow-500' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          {item.buyAgain && (
                            <span className={`text-[10px] font-black px-1.5 rounded ${
                              item.buyAgain === 'sim' ? 'text-emerald-700 bg-emerald-100' :
                              item.buyAgain === 'não' ? 'text-rose-700 bg-rose-100' :
                              'text-orange-700 bg-orange-100'
                            }`}>
                              {item.buyAgain === 'sim' ? 'Compra Garantida 👍' : item.buyAgain === 'não' ? 'Evitar Compra 👎' : 'Avaliar Novamente 🤔'}
                            </span>
                          )}
                        </div>
                        {item.review && (
                          <p className="text-[#4B5563] font-medium italic text-[11px] line-clamp-2">
                            "{item.review}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-gray-500">
                        <span>Ainda não avaliado.</span>
                        <button 
                          onClick={() => startLabEditing(item)}
                          className="font-bold text-pink-600 hover:underline cursor-pointer"
                        >
                          Avaliar Marca
                        </button>
                      </div>
                    )}

                    {item.rating && (
                      <div className="flex justify-end pt-1">
                        <button 
                          onClick={() => startLabEditing(item)}
                          className="text-[10px] text-slate-500 hover:text-pink-600 hover:underline font-bold cursor-pointer"
                        >
                          Editar Parecer Técnico
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
