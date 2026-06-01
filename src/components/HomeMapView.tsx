/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Room, RoomPhoto, MaintenanceHistory, RoomChecklistItem } from '../types';
import * as LucideIcons from 'lucide-react';
import { 
  Plus, Trash2, Edit2, Camera, ShieldAlert, Key, HelpCircle, 
  Settings, CheckSquare, Wrench, FileText, ChevronLeft, Calendar, 
  MapPin, Check, Save, Image, Heart, Wifi, Trash, X
} from 'lucide-react';

// Form interface
interface HomeMapViewProps {
  rooms: Room[];
  addRoom: (room: Omit<Room, 'id' | 'checklist' | 'photos' | 'maintenance' | 'objects'>) => void;
  updateRoom: (roomId: string, updatedFields: Partial<Room>) => void;
  deleteRoom: (roomId: string) => void;
  addRoomChecklistItem: (roomId: string, label: string) => void;
  toggleRoomChecklistItem: (roomId: string, itemId: string) => void;
  deleteRoomChecklistItem: (roomId: string, itemId: string) => void;
  addRoomPhoto: (roomId: string, photoUrl: string, note: string) => void;
  deleteRoomPhoto: (roomId: string, photoId: string) => void;
  addRoomMaintenance: (roomId: string, description: string, cost: number, date: string) => void;
  deleteRoomMaintenance: (roomId: string, maintenanceId: string) => void;
  addRoomObject: (roomId: string, objectName: string) => void;
  removeRoomObject: (roomId: string, objectName: string) => void;
}

// Icon helper components
function SafeLucideIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Home;
  return <IconComponent className={className} />;
}

export default function HomeMapView({
  rooms, addRoom, updateRoom, deleteRoom,
  addRoomChecklistItem, toggleRoomChecklistItem, deleteRoomChecklistItem,
  addRoomPhoto, deleteRoomPhoto, addRoomMaintenance, deleteRoomMaintenance,
  addRoomObject, removeRoomObject
}: HomeMapViewProps) {

  // Standard translucent CSS unique layout style inline template
  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '20px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.03)'
  };

  // Selected Room ID to view full room details
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Forms modals UI state
  const [showAddRoomForm, setShowAddRoomForm] = useState(false);
  const [showEditRoomForm, setShowEditRoomForm] = useState<string | null>(null);

  // New room states
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomColor, setNewRoomColor] = useState('#22c55e');
  const [newRoomIcon, setNewRoomIcon] = useState('DoorOpen');

  // New checklist item inside selected room
  const [newChecklistLabel, setNewChecklistLabel] = useState('');

  // New maintenance record inside selected room
  const [mntDesc, setMntDesc] = useState('');
  const [mntCost, setMntCost] = useState(0);
  const [mntDate, setMntDate] = useState(new Date().toISOString().split('T')[0]);

  // New base64 photo inside selected room
  const [photoNote, setPhotoNote] = useState('');
  const [photoError, setPhotoError] = useState('');

  // New registered item
  const [objectName, setObjectName] = useState('');

  // Handles local file selector to base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // limit 2MB
      setPhotoError('A imagem excede o valor limite sugerido de 2MB para salvar localmente.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (selectedRoomId) {
        addRoomPhoto(selectedRoomId, base64String, photoNote.trim() || 'Foto de inspeção ou detalhe.');
        setPhotoNote('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    addRoom({
      name: newRoomName.trim(),
      color: newRoomColor,
      iconName: newRoomIcon,
      criticalInfo: 'Preencher com dados técnicos importantes sobre o cômodo...'
    });

    setNewRoomName('');
    setShowAddRoomForm(false);
  };

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  // Inspection audit status notifier helper
  // If no photo uploads or checklist interactions happened recently, suggest inspection
  const getInspectionWarning = (room: Room) => {
    // Room checklist completeness percentage
    const total = room.checklist.length;
    const completed = room.checklist.filter(c => c.checked).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 100;
    
    // Inspections should ideally have items checked. If 0 items checked, it is flagged as pending
    const isOverdue = completed === 0 && total > 0;
    return {
      percentage,
      isOverdue,
      message: isOverdue ? '⚠️ Inspeção Semanal Pendente! Realize o tour físico e marque as caixas de verificação.' : '✨ Inspeção semanal em dia!'
    };
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* 1. ROOMS INDEX MAP PLATFORM VIEW */}
      {!selectedRoomId ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-[#2D253D] flex items-center gap-2">
                <span className="p-1 px-2.5 bg-emerald-500 text-white rounded-lg text-lg">4</span>
                Mapa da Casa — Cômodos Cadastrados
              </h2>
              <p className="text-sm text-[#4B5563] font-semibold">
                Navegue pelas partições físicas do seu lar. Registre manutenções prediais, guarde a localização de chaves e controle vistorias periódicas.
              </p>
            </div>

            <button
              onClick={() => setShowAddRoomForm(!showAddRoomForm)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-md flex items-center gap-2 self-start cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Novo Cômodo
            </button>
          </div>

          {/* Create room card modal form */}
          {showAddRoomForm && (
            <form onSubmit={handleCreateRoom} style={glassStyle} className="p-5 space-y-4 max-w-xl">
              <h3 className="text-sm font-black text-[#2D253D] uppercase tracking-wider">Registrar Novo Cômodo</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 col-span-1 sm:col-span-2">
                  <label className="text-xs font-bold text-[#4B5563] uppercase font-mono">Nome da Zona/Cômodo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Quarto de Hóspedes"
                    value={newRoomName}
                    onChange={e => setNewRoomName(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-205 rounded-xl outline-none text-sm font-semibold focus:border-emerald-500 text-[#2D253D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#4B5563] uppercase font-mono">Tom Principal</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newRoomColor}
                      onChange={e => setNewRoomColor(e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded-lg cursor-pointer bg-transparent"
                    />
                    <span className="text-xs font-mono font-bold uppercase text-[#2D253D]">{newRoomColor}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#4B5563] uppercase font-mono">Ícone Decorativo</label>
                <select
                  value={newRoomIcon}
                  onChange={e => setNewRoomIcon(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-202 rounded-xl text-sm font-bold focus:border-emerald-500 cursor-pointer text-[#2D253D]"
                >
                  <option value="DoorOpen">Porta Aberta 🚪</option>
                  <option value="ChefHat">Cozinha 🍳</option>
                  <option value="Tv">Sala de Estar 🛋️</option>
                  <option value="Bed">Quarto de Dormir 🛏️</option>
                  <option value="Bath">Banheiro 🚿</option>
                  <option value="Home">Hall de Entrada 🏠</option>
                  <option value="Sofa">Varanda ou Sacada 🪴</option>
                  <option value="Wrench">Oficina / Garagem 🚗</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddRoomForm(false)}
                  className="px-4 py-2 border border-slate-350 text-slate-750 rounded-xl text-sm font-bold hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition"
                >
                  Criar Cômodo
                </button>
              </div>
            </form>
          )}

          {/* House Rooms layouts block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map(room => {
              const audit = getInspectionWarning(room);
              const mntTotal = room.maintenance.reduce((sum, h) => sum + h.cost, 0);

              return (
                <div 
                  key={room.id}
                  style={glassStyle}
                  className="overflow-hidden shadow-xs hover:border-emerald-500 transition flex flex-col"
                >
                  {/* Color band */}
                  <div className="h-2.5 w-full rounded-t-[20px]" style={{ backgroundColor: room.color }} />

                  <div className="p-5 space-y-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl text-white font-black" style={{ backgroundColor: room.color }}>
                          <SafeLucideIcon name={room.iconName} className="w-5 h-5" />
                        </div>
                        <h3 className="font-extrabold text-[#2D253D] text-lg capitalize">{room.name}</h3>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm(`Excluir o cômodo ${room.name} e deletar todas as tarefas, manutenções e fotos vinculadas?`)) {
                            deleteRoom(room.id);
                          }
                        }}
                        className="p-1 hover:bg-rose-50 text-rose-500 rounded transition cursor-pointer"
                        title="Remover Cômodo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Inspections warning badge */}
                    <div className={`p-2.5 rounded-xl border text-xs font-semibold ${
                      audit.isOverdue 
                        ? 'bg-amber-50 border-amber-200 text-amber-800' 
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}>
                      <p className="flex items-center gap-1">
                        <CheckSquare className="w-4 h-4" />
                        <span>Inspeção Semanal: {audit.percentage}% concluída</span>
                      </p>
                      {audit.isOverdue && (
                        <p className="text-[10px] text-amber-600 mt-1">Nenhum item do checklist foi marcado ultimamente.</p>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs font-bold text-[#4B5563] font-mono">
                      <div className="flex justify-between">
                        <span>Checklist de manutenção:</span>
                        <span className="text-[#2D253D]">{room.checklist.length} itens</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Histórico de gastos:</span>
                        <span className="text-[#2D253D]">R$ {mntTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Arquivo de fotos:</span>
                        <span className="text-[#2D253D]">{room.photos.length} registradas</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rastreador de objetos:</span>
                        <span className="text-[#2D253D]">{room.objects.length} guardados</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white/40 border-t border-white/60 flex justify-between items-center">
                    <button
                      onClick={() => setSelectedRoomId(room.id)}
                      className="text-xs font-black text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Acessar Cadastros do Cômodo →
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      ) : (

        // 2. DETAILED PRIVATE VIEW FOR THE SELECTED ROOM
        <div className="space-y-6">
          <button
            onClick={() => setSelectedRoomId(null)}
            className="px-3.5 py-2 bg-white/70 hover:bg-white/90 border border-white/50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar para Visão Geral da Casa
          </button>

          {/* Room Banner */}
          <div className="p-6 rounded-2xl border flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-white hover:brightness-105 transition-all"
               style={{ backgroundColor: selectedRoom?.color || '#22c55e' }}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                {selectedRoom?.iconName && <SafeLucideIcon name={selectedRoom.iconName} className="w-8 h-8 text-white" />}
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest font-mono opacity-80">Ambiente Residencial</span>
                <h1 className="text-3xl font-black capitalize tracking-tight">{selectedRoom?.name}</h1>
              </div>
            </div>

            {/* Inspeção alert in banner */}
            <div className="p-3 bg-white/25 rounded-xl text-sm border border-white/20 max-w-sm">
              <span className="font-extrabold flex items-center gap-1">
                <CheckSquare className="w-4 h-4" /> Checklist do Ambiente:
              </span>
              <p className="text-xs mt-1">Efetue a inspeção das frestas, lâmpadas, umidade e interruptores uma vez por semana.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Memória do Campo & Inspeção checklist */}
            <div className="space-y-6 lg:col-span-1">
              
              {/* Memória da Casa */}
              <div style={glassStyle} className="p-5 space-y-3">
                <h3 className="text-sm font-black text-[#2D253D] uppercase tracking-wider flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-500" />
                  Memória Crítica e Manuais
                </h3>
                <p className="text-xs text-[#4B5563] font-semibold">
                  Armazene dados sigilosos ou técnicos sobre o ambiente: modelo do ar-condicionado, localização de fiação, senhas de Wi-Fi, etc.
                </p>
                <textarea
                  rows={4}
                  value={selectedRoom?.criticalInfo || ''}
                  onChange={e => selectedRoom && updateRoom(selectedRoom.id, { criticalInfo: e.target.value })}
                  placeholder="Ex: Senha WI-FI: 123456 / Chave reserva está embaixo da pedra do jardim do cômodo..."
                  className="w-full px-3 py-2 bg-white border border-slate-210 rounded-xl text-xs font-semibold font-mono text-[#2D253D]"
                />
              </div>

              {/* Inspeção Semanal checklist (repeatable) */}
              <div style={glassStyle} className="p-5 space-y-4">
                <h3 className="text-sm font-black text-[#2D253D] uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-500" />
                  Checklist de Inspeção Semanal
                </h3>

                <div className="space-y-2 select-none max-h-[12rem] overflow-y-auto pr-1">
                  {selectedRoom?.checklist.map(item => (
                    <div key={item.id} className="flex items-center justify-between gap-2 py-1 border-b border-dashed border-slate-105">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleRoomChecklistItem(selectedRoom.id, item.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer ${
                            item.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-350 bg-white'
                          }`}
                        >
                          {item.checked && <Check className="w-2.5 h-2.5 stroke-[4px]" />}
                        </button>
                        <span className={`text-xs font-semibold ${item.checked ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                          {item.label}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteRoomChecklistItem(selectedRoom.id, item.id)}
                        className="text-gray-400 hover:text-rose-500 shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {selectedRoom?.checklist.length === 0 && (
                    <p className="text-xs text-[#4B5563] font-semibold">Nenhum teste de vistoria programado para este quarto.</p>
                  )}
                </div>

                {/* Add check item form */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Checar mofo nas tomadas"
                    value={newChecklistLabel}
                    onChange={e => setNewChecklistLabel(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-202 text-xs rounded-xl text-slate-800 font-semibold"
                  />
                  <button
                    onClick={() => {
                      if (!newChecklistLabel.trim() || !selectedRoom) return;
                      addRoomChecklistItem(selectedRoom.id, newChecklistLabel.trim());
                      setNewChecklistLabel('');
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              </div>

              {/* Objects Tracker linked inside this room */}
              <div style={glassStyle} className="p-5 space-y-4">
                <h3 className="text-sm font-black text-[#2D253D] uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  Rastreador de Objetos Perdíveis
                </h3>

                <div className="flex flex-wrap gap-1.5 max-h-[8rem] overflow-y-auto pr-1">
                  {selectedRoom?.objects.map(obj => (
                    <div key={obj} className="p-1 px-2.5 bg-white/80 border border-slate-150 text-xs rounded-lg flex items-center gap-1 text-slate-700 font-bold">
                      <span>{obj}</span>
                      <button onClick={() => removeRoomObject(selectedRoom.id, obj)} className="text-slate-400 hover:text-rose-500">
                        <X className="w-3" />
                      </button>
                    </div>
                  ))}
                  {selectedRoom?.objects.length === 0 && (
                    <p className="text-xs text-[#4B5563] font-semibold">Nenhum objeto do cofre crítico associado especificamente a este cômodo.</p>
                  )}
                </div>

                <div className="flex gap-2 pt-1 border-t border-slate-105">
                  <input
                    type="text"
                    placeholder="Ex: Controle do ventilador"
                    value={objectName}
                    onChange={e => setObjectName(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-202 text-xs rounded-xl text-slate-800 font-semibold"
                  />
                  <button
                    onClick={() => {
                      if (!objectName.trim() || !selectedRoom) return;
                      addRoomObject(selectedRoom.id, objectName.trim());
                      setObjectName('');
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Registrar
                  </button>
                </div>
              </div>

            </div>

            {/* Right: photos & maintenance logs */}
            <div className="space-y-6 lg:col-span-2">
              
              {/* Local photos visual archive files organizer */}
              <div style={glassStyle} className="p-5 space-y-4">
                <h3 className="text-sm font-black text-[#2D253D] uppercase tracking-wider flex items-center gap-2">
                  <Image className="w-4 h-4 text-emerald-500" />
                  Arquivo Visual de Inspeção (Vistorias)
                </h3>
                <p className="text-xs text-[#4B5563] font-semibold">Tire fotos reais pelo celular ou faça upload de imagens das frestas, vazamentos e manutenções passadas.</p>

                {/* Upload elements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/40 p-4 rounded-xl border border-slate-202">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer text-slate-800"
                  />
                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder="Nota descritiva rápida para a foto"
                      value={photoNote}
                      onChange={e => setPhotoNote(e.target.value)}
                      className="w-full px-3 py-1 bg-white border border-slate-205 text-xs rounded-lg text-slate-800 font-semibold"
                    />
                    {photoError && <p className="text-[10px] text-rose-500 font-bold">{photoError}</p>}
                  </div>
                </div>

                {/* Photos browser */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {selectedRoom?.photos.map(p => (
                    <div key={p.id} className="group relative border border-slate-205 rounded-xl overflow-hidden bg-white/40 max-w-[12rem] mx-auto w-full">
                      
                      {p.photoUrl ? (
                        <img src={p.photoUrl} alt="Vistoria" referrerPolicy="no-referrer" className="w-full h-24 object-cover" />
                      ) : (
                        <div className="w-full h-24 flex items-center justify-center text-gray-400">
                          <Camera className="w-6 h-6" />
                        </div>
                      )}

                      <div className="p-2 space-y-1 bg-white text-[10px] select-none text-slate-700 font-bold">
                        <p className="font-bold line-clamp-1">"{p.note}"</p>
                        <p className="font-mono text-slate-400">{p.date.split('-').reverse().join('/')}</p>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm('Deletar esta imagem definitivamente?')) {
                            if (selectedRoom) deleteRoomPhoto(selectedRoom.id, p.id);
                          }
                        }}
                        className="absolute top-1.5 right-1.5 p-1 bg-slate-900/60 transition text-rose-500 hover:bg-slate-950/80 rounded-md cursor-pointer"
                        title="Deletar foto"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {selectedRoom?.photos.length === 0 && (
                    <div className="col-span-full py-8 text-center text-xs text-slate-500 italic font-semibold">
                      Nenhuma foto de vistoria armazenada para este quarto.
                    </div>
                  )}
                </div>
              </div>

              {/* Maintenance historic expenses logger */}
              <div style={glassStyle} className="p-5 space-y-4">
                <h3 className="text-sm font-black text-[#2D253D] uppercase tracking-wider flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-emerald-500" />
                  Registro e Histórico de Manutenções Prediais
                </h3>

                {/* Add log entry */}
                <div className="bg-white/40 p-4 rounded-xl border border-slate-202 gap-3 grid grid-cols-1 sm:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#4B5563]">Descrição do Reparo</label>
                    <input
                      type="text"
                      placeholder="Ex: Troca reparo descarga"
                      value={mntDesc}
                      onChange={e => setMntDesc(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-202 text-xs rounded-lg text-slate-800 font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#4B5563]">Custo Financeiro (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="280.00"
                      value={mntCost}
                      onChange={e => setMntCost(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-white border border-slate-202 text-xs rounded-lg font-mono text-slate-800 font-semibold"
                    />
                  </div>
                  <div className="space-y-1 flex items-end justify-between gap-1.5">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-[#4B5563] block">Data de Realização</label>
                      <input
                        type="date"
                        value={mntDate}
                        onChange={e => setMntDate(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-202 text-xs rounded-lg font-mono text-slate-800 font-semibold"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (!mntDesc.trim() || !selectedRoom) return;
                        addRoomMaintenance(selectedRoom.id, mntDesc.trim(), mntCost, mntDate);
                        setMntDesc('');
                        setMntCost(0);
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer h-[28px] self-end mb-[1px]"
                    >
                      Inserir
                    </button>
                  </div>
                </div>

                {/* Maintenance timeline */}
                <div className="divide-y divide-slate-100 max-h-[14rem] overflow-y-auto pr-1">
                  {selectedRoom?.maintenance.map(mnt => (
                    <div key={mnt.id} className="py-2.5 flex items-center justify-between text-xs text-slate-705 font-semibold">
                      <div>
                        <p className="font-bold text-[#2D253D]">{mnt.description}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Concluído em: {mnt.date.split('-').reverse().join('/')}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold font-mono text-emerald-600 font-black">R$ {mnt.cost.toFixed(2)}</span>
                        <button
                          onClick={() => {
                            if (confirm('Remover esta manutenção do log?')) {
                              if (selectedRoom) deleteRoomMaintenance(selectedRoom.id, mnt.id);
                            }
                          }}
                          className="text-gray-400 hover:text-rose-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {selectedRoom?.maintenance.length === 0 && (
                    <p className="text-center py-6 text-xs text-slate-500 italic font-semibold">Nenhum evento de reparação cadastrado neste cômodo.</p>
                  )}
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
