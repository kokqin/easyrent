
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MOCK_PROPERTIES } from '../constants';
import { Tenant, TenantStatus } from '../types';

interface LeaseDetailsProps {
  tenantId: string;
  tenants: Tenant[];
  onUpdateTenant: (tenant: Tenant) => void;
  onBack: () => void;
}

const LeaseDetails: React.FC<LeaseDetailsProps> = ({ tenantId, tenants, onUpdateTenant, onBack }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showIdPreview, setShowIdPreview] = useState(false);
  
  // Helper: Convert "MMM DD, YYYY" to "YYYY-MM-DD" for HTML Date Input
  const formatToISO = (displayDate: string) => {
    if (!displayDate || displayDate === 'TBD') return '';
    const d = new Date(displayDate);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  // Helper: Convert "YYYY-MM-DD" to "MMM DD, YYYY" for consistent storage
  const formatToDisplay = (isoStr: string) => {
    if (!isoStr) return 'TBD';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Editable fields state (stored in ISO for inputs, converted back on save)
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<TenantStatus>('Active');
  const [editProperty, setEditProperty] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editLeaseStart, setEditLeaseStart] = useState('');
  const [editLeaseEnd, setEditLeaseEnd] = useState('');
  const [editRent, setEditRent] = useState<number>(0);
  const [editDeposit, setEditDeposit] = useState<number>(0);
  const [editAvatar, setEditAvatar] = useState<string | undefined>(undefined);
  const [editNotes, setEditNotes] = useState('');
  
  const [photos, setPhotos] = useState<string[]>([]);
  const [idPhoto, setIdPhoto] = useState<string | undefined>(undefined);
  
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const idFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) return;

    const found = tenants.find(t => t.id === tenantId);
    if (found) {
      setTenant(found);
      setEditName(found.name);
      setEditStatus(found.status);
      setEditProperty(found.property);
      setEditUnit(found.unit);
      setEditLeaseStart(formatToISO(found.leaseStart));
      setEditLeaseEnd(formatToISO(found.leaseEnd));
      setEditRent(found.rent);
      setEditDeposit(found.deposit);
      setEditAvatar(found.avatar);
      setEditNotes(found.notes || '');
      setPhotos(found.photos || []);
      setIdPhoto(found.idPhoto);
    }
  }, [tenantId, tenants, isEditing]);

  const availableRooms = useMemo(() => {
    const property = MOCK_PROPERTIES.find(p => p.name === editProperty);
    return property ? property.rooms : [];
  }, [editProperty]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeIdPhoto = () => {
    setIdPhoto(undefined);
  };

  if (!tenant) return null;

  const getRemainingDays = (endStr: string) => {
    // Input might be display format or ISO format depending on edit state
    const end = new Date(endStr);
    const now = new Date();
    if (isNaN(end.getTime())) return 0;
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getRemainingDays(isEditing ? editLeaseEnd : tenant.leaseEnd);

  const saveAllChanges = () => {
    const updatedTenant: Tenant = {
      ...tenant,
      name: editName,
      status: editStatus,
      property: editProperty,
      unit: editUnit,
      leaseStart: formatToDisplay(editLeaseStart),
      leaseEnd: formatToDisplay(editLeaseEnd),
      rent: editRent,
      deposit: editDeposit,
      avatar: editAvatar,
      notes: editNotes,
      photos: photos,
      idPhoto: idPhoto
    };
    onUpdateTenant(updatedTenant);
    setIsEditing(false);
  };

  const statusOptions: TenantStatus[] = ['Active', 'Moving Out', 'Late Payment'];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 pb-2 border-b border-gray-200 dark:border-white/5">
        <button 
          onClick={onBack}
          className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold leading-tight tracking-[-0.015em] text-center flex-1">
          {isEditing ? 'Editing Profile' : 'Tenant Details'}
        </h1>
        <button 
          onClick={() => isEditing ? saveAllChanges() : setIsEditing(true)}
          className={`flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${isEditing ? 'text-primary' : 'text-slate-400'}`}
        >
          <span className="material-symbols-outlined text-[24px]">{isEditing ? 'check' : 'edit'}</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col gap-6 p-4 pb-48">
        {/* Profile Section */}
        <section className="flex flex-col items-center gap-4 py-2">
          <div className="relative">
            <input type="file" hidden ref={avatarFileInputRef} accept="image/*" onChange={handleAvatarUpload} />
            <div 
              onClick={() => isEditing && avatarFileInputRef.current?.click()}
              className={`h-32 w-32 rounded-full bg-cover bg-center shadow-xl border-4 ${isEditing ? 'border-primary cursor-pointer' : 'border-white/10'} relative overflow-hidden group`} 
              style={{ backgroundImage: `url('${editAvatar || tenant.avatar}')` }}
            >
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white transition-opacity">
                  <span className="material-symbols-outlined text-3xl">photo_camera</span>
                </div>
              )}
            </div>
            {!isEditing && (
              <div className="absolute bottom-1 right-1 bg-background-dark rounded-full p-1.5 shadow-lg">
                <div className={`size-3 rounded-full ${tenant.status === 'Active' ? 'bg-primary' : tenant.status === 'Moving Out' ? 'bg-orange-500' : 'bg-red-500'}`}></div>
              </div>
            )}
          </div>
          
          {isEditing ? (
            <div className="w-full space-y-4 px-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  className="w-full bg-white dark:bg-surface-dark border-none rounded-2xl p-4 font-bold text-lg focus:ring-2 focus:ring-primary shadow-sm"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Manually Set Status</label>
                <div className="flex gap-2">
                  {statusOptions.map(option => (
                    <button
                      key={option}
                      onClick={() => setEditStatus(option)}
                      className={`flex-1 py-3 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                        editStatus === option 
                        ? 'bg-primary/20 text-primary border-primary' 
                        : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-white/5 text-slate-400'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Property</label>
                  <select 
                    className="w-full bg-white dark:bg-surface-dark border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary shadow-sm"
                    value={editProperty}
                    onChange={(e) => {
                      setEditProperty(e.target.value);
                      setEditUnit('');
                    }}
                  >
                    {MOCK_PROPERTIES.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Unit Number</label>
                  <select 
                    className="w-full bg-white dark:bg-surface-dark border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary shadow-sm"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                  >
                    <option value="" disabled>Select Unit</option>
                    {availableRooms.map(room => (
                      <option key={room.id} value={room.number}>{room.number}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold tracking-tight">{tenant.name}</h2>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px] text-primary">apartment</span>
                  <span>{tenant.property} • Unit {tenant.unit}</span>
                </div>
                <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  tenant.status === 'Active' 
                    ? 'bg-primary/10 text-primary border-primary/20' 
                    : tenant.status === 'Moving Out'
                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {tenant.status}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Lease Period */}
        <section>
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="material-symbols-outlined text-primary text-[22px]">event_repeat</span>
            <h3 className="text-base font-black uppercase tracking-widest">Lease Period</h3>
          </div>
          <div className="bg-white dark:bg-surface-dark p-5 rounded-[28px] border border-slate-100 dark:border-white/5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="flex flex-col flex-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</span>
                {isEditing ? (
                  <input 
                    type="date" 
                    className="mt-1 bg-slate-50 dark:bg-background-dark border-none rounded-xl p-3 text-xs font-bold"
                    value={editLeaseStart}
                    onChange={(e) => setEditLeaseStart(e.target.value)}
                  />
                ) : (
                  <span className="text-sm font-bold mt-1.5">{tenant.leaseStart}</span>
                )}
              </div>
              <span className="material-symbols-outlined text-slate-300 mx-3 shrink-0">east</span>
              <div className="flex flex-col flex-1 items-end text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date</span>
                {isEditing ? (
                  <input 
                    type="date" 
                    className="mt-1 bg-slate-50 dark:bg-background-dark border-none rounded-xl p-3 text-xs font-bold"
                    value={editLeaseEnd}
                    onChange={(e) => setEditLeaseEnd(e.target.value)}
                  />
                ) : (
                  <span className="text-sm font-bold mt-1.5">{tenant.leaseEnd}</span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`size-2.5 rounded-full ${daysLeft > 60 ? 'bg-primary' : daysLeft > 0 ? 'bg-orange-500' : 'bg-red-500'} shadow-[0_0_8px_rgba(0,0,0,0.1)]`}></span>
                <span className="text-sm text-slate-400 font-bold uppercase tracking-wide">Remaining</span>
              </div>
              <span className={`text-sm font-black ${daysLeft > 60 ? 'text-primary' : daysLeft > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                {daysLeft > 0 ? `${daysLeft} Days` : 'Expired'}
              </span>
            </div>
          </div>
        </section>

        {/* Identity Verification */}
        <section>
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="material-symbols-outlined text-primary text-[22px]">badge</span>
            <h3 className="text-base font-black uppercase tracking-widest">Identity Verification</h3>
          </div>
          <div className="bg-white dark:bg-surface-dark p-4 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-sm">
            <input type="file" accept="image/*" className="hidden" ref={idFileInputRef} onChange={handleIdUpload} />
            
            <div className="flex items-center justify-between gap-4">
              <div 
                className={`flex items-center gap-4 flex-1 ${idPhoto ? 'cursor-pointer group/id' : ''}`}
                onClick={() => idPhoto && setShowIdPreview(true)}
              >
                <div className={`size-12 rounded-2xl flex items-center justify-center ${idPhoto ? 'bg-primary/10 text-primary group-hover/id:bg-primary group-hover/id:text-background-dark transition-colors' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                  <span className="material-symbols-outlined text-2xl">
                    {idPhoto ? 'visibility' : 'no_accounts'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {idPhoto ? 'ID Document Attached' : 'No ID Document'}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {idPhoto ? 'Click to view document' : 'Required for compliance'}
                  </p>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  {idPhoto && (
                    <button 
                      onClick={removeIdPhoto}
                      className="size-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"
                      title="Remove document"
                    >
                      <span className="material-symbols-outlined text-xl font-black">delete</span>
                    </button>
                  )}
                  <button 
                    onClick={() => idFileInputRef.current?.click()}
                    className="h-10 px-4 flex items-center justify-center bg-primary text-background-dark font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/10 active:scale-95 transition-transform"
                  >
                    {idPhoto ? 'Replace' : 'Upload'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Financials */}
        <section>
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="material-symbols-outlined text-primary text-[22px]">payments</span>
            <h3 className="text-base font-black uppercase tracking-widest">Financials</h3>
          </div>
          <div className="bg-white dark:bg-surface-dark p-5 rounded-[28px] border border-slate-100 dark:border-white/5 space-y-5 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-sm text-slate-400 font-bold">Monthly Rent</span>
              </div>
              {isEditing ? (
                <div className="flex items-center bg-slate-50 dark:bg-background-dark rounded-xl px-3 py-2">
                  <span className="text-sm font-black mr-1">$</span>
                  <input 
                    type="number"
                    className="bg-transparent border-none p-0 text-xl font-black w-24 focus:ring-0"
                    value={editRent}
                    onChange={(e) => setEditRent(Number(e.target.value))}
                  />
                </div>
              ) : (
                <span className="text-2xl font-black text-primary">${tenant.rent}</span>
              )}
            </div>
            <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-4">
              <span className="text-sm text-slate-400 font-bold">Security Deposit</span>
              {isEditing ? (
                <div className="flex items-center bg-slate-50 dark:bg-background-dark rounded-xl px-3 py-2">
                  <span className="text-sm font-black mr-1">$</span>
                  <input 
                    type="number"
                    className="bg-transparent border-none p-0 text-lg font-black w-24 focus:ring-0"
                    value={editDeposit}
                    onChange={(e) => setEditDeposit(Number(e.target.value))}
                  />
                </div>
              ) : (
                <span className="text-xl font-black text-slate-300">${tenant.deposit}</span>
              )}
            </div>
          </div>
        </section>

        {/* Lease Notes */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="material-symbols-outlined text-primary text-[22px]">notes</span>
            <h3 className="text-base font-black uppercase tracking-widest">Lease Notes</h3>
          </div>
          <div className="bg-white dark:bg-surface-dark p-5 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-sm">
            {isEditing ? (
              <textarea 
                className="w-full bg-slate-50 dark:bg-background-dark border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary min-h-[120px] resize-none shadow-inner"
                placeholder="Add notes..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {tenant.notes || 'No special notes.'}
              </p>
            )}
          </div>
        </section>
      </main>

      {/* ID Photo Preview Modal */}
      {showIdPreview && idPhoto && (
        <div className="fixed inset-0 z-[100] bg-background-dark/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute top-8 right-8 z-10">
            <button 
              onClick={() => setShowIdPreview(false)}
              className="size-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <span className="material-symbols-outlined font-black">close</span>
            </button>
          </div>
          <div className="w-full max-w-lg aspect-[1.58/1] rounded-[32px] overflow-hidden shadow-2xl border border-white/10 bg-slate-800 flex items-center justify-center">
            <img 
              src={idPhoto} 
              alt="Tenant ID" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="mt-8 text-center">
            <h3 className="text-xl font-black tracking-tight">{tenant.name}</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Identity Document Proof</p>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-2xl border-t border-gray-200 dark:border-white/5 p-5 pb-9 z-40">
        <div className="flex gap-3 max-w-md mx-auto">
          <button 
            onClick={isEditing ? () => setIsEditing(false) : onBack} 
            className="flex-1 h-14 flex items-center justify-center rounded-2xl bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white font-black text-sm uppercase tracking-widest active:scale-95 transition-transform"
          >
            {isEditing ? 'Cancel' : 'Back'}
          </button>
          <button 
            onClick={isEditing ? saveAllChanges : () => setIsEditing(true)} 
            className="flex-[2] h-14 flex items-center justify-center rounded-2xl bg-primary text-[#102216] font-black text-base gap-2 shadow-lg shadow-primary/25 active:scale-95 transition-transform uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-[20px] font-black">{isEditing ? 'save' : 'edit'}</span>
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaseDetails;
