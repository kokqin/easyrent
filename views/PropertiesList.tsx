
import React, { useState } from 'react';
import { MOCK_PROPERTIES } from '../constants';
import { Property, Expense } from '../types';

interface PropertiesListProps {
  expenses: Expense[];
  properties: Property[];
  onAddProperty: (p: any) => void;
  onUpdateProperty: (p: Property) => void;
  onDeleteProperty: (id: string) => void;
  onAddRoom: (pId: string, num: string) => void;
  onUpdateRoom: (pId: string, rId: string, num: string) => void;
  onDeleteRoom: (pId: string, rId: string) => void;
}

const PropertiesList: React.FC<PropertiesListProps> = ({
  expenses,
  properties,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom
}) => {
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [tempAddress, setTempAddress] = useState('');

  const handleAddProperty = () => {
    onAddProperty({
      name: 'New Property',
      address: 'Add address here...',
      rooms: []
    });
  };

  const savePropertyInfo = (id: string) => {
    const prop = properties.find(p => p.id === id);
    if (prop) {
      onUpdateProperty({ ...prop, name: tempName, address: tempAddress });
    }
    setEditingPropertyId(null);
  };

  const handleSaveRoomNumber = (propertyId: string, roomId: string) => {
    onUpdateRoom(propertyId, roomId, tempName);
    setEditingRoomId(null);
  };

  const startEditingProperty = (property: Property) => {
    setEditingPropertyId(property.id);
    setTempName(property.name);
    setTempAddress(property.address);
  };

  const getLastCleaningDate = (propertyId: string) => {
    // Check expenses for 'Cleaning' category and specific propertyId
    const cleaningExpenses = expenses
      .filter(e => e.category === 'Cleaning' && e.propertyId === propertyId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return cleaningExpenses[0]?.date || 'No record';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 pt-12 pb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Properties</h1>
        <button
          onClick={handleAddProperty}
          className="size-11 flex items-center justify-center bg-primary text-background-dark rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined font-bold">add</span>
        </button>
      </header>

      <div className="px-5 flex flex-col gap-5 pb-20">
        {properties.map((property) => (
          <div key={property.id} className="bg-white dark:bg-surface-dark rounded-3xl border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Property Header */}
            <div className="p-5 bg-slate-50/50 dark:bg-white/5">
              <div className="flex items-start justify-between">
                {editingPropertyId === property.id ? (
                  <div className="flex flex-col gap-2 flex-1 mr-4">
                    <input
                      autoFocus
                      className="bg-background-light dark:bg-background-dark border-primary border rounded-xl px-3 py-2 text-sm w-full outline-none"
                      placeholder="Property Name"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                    />
                    <input
                      className="bg-background-light dark:bg-background-dark border-primary border rounded-xl px-3 py-1.5 text-xs w-full outline-none"
                      placeholder="Full Address"
                      value={tempAddress}
                      onChange={(e) => setTempAddress(e.target.value)}
                    />
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => savePropertyInfo(property.id)}
                        className="bg-primary text-background-dark text-[10px] font-black px-3 py-1.5 rounded-lg uppercase"
                      >
                        Save Info
                      </button>
                      <button
                        onClick={() => setEditingPropertyId(null)}
                        className="bg-slate-200 dark:bg-white/10 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-black truncate text-slate-900 dark:text-white">{property.name}</h3>
                    <div className="flex items-center gap-1 mt-1 text-slate-400">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      <p className="text-xs font-medium truncate leading-none">{property.address}</p>
                    </div>
                    {/* Last Cleaning Display */}
                    <div className="mt-3 flex items-center gap-1.5 bg-blue-500/10 w-fit px-2.5 py-1 rounded-lg border border-blue-500/20">
                      <span className="material-symbols-outlined text-[14px] text-blue-500">cleaning_services</span>
                      <span className="text-[10px] font-black uppercase text-blue-500 tracking-wider">
                        Last Cleaning: {getLastCleaningDate(property.id)}
                      </span>
                    </div>
                  </div>
                )}

                {editingPropertyId !== property.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEditingProperty(property)}
                      className="p-2 text-slate-400 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteProperty(property.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Rooms List */}
            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">meeting_room</span>
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Rooms & Units</span>
                </div>
                <button
                  onClick={() => onAddRoom(property.id, 'New Room')}
                  className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:opacity-80 transition-opacity"
                >
                  <span className="material-symbols-outlined text-sm font-bold">add_circle</span>
                  Add Unit
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {property.rooms.map((room) => (
                  <div key={room.id} className="group relative flex items-center justify-between px-3.5 py-3 rounded-2xl bg-slate-50/50 dark:bg-background-dark border border-slate-200 dark:border-white/5">
                    {editingRoomId === room.id ? (
                      <input
                        autoFocus
                        className="bg-white dark:bg-surface-dark border-primary border rounded-lg px-2 py-1 text-xs w-full outline-none"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onBlur={() => handleSaveRoomNumber(property.id, room.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRoomNumber(property.id, room.id)}
                      />
                    ) : (
                      <>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Room {room.number}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setEditingRoomId(room.id); setTempName(room.number); }}
                            className="text-slate-400 hover:text-primary"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => onDeleteRoom(property.id, room.id)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertiesList;
