
import React, { useState } from 'react';
import { AppState, Contact } from '../types';
import { Plus, Search, Phone, User as UserIcon, Building2 } from 'lucide-react';

interface ContactsProps {
  state: AppState;
  onUpdate: (contacts: Contact[]) => void;
}

const Contacts: React.FC<ContactsProps> = ({ state, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'customer' | 'supplier'>('customer');
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = state.contacts.filter(c => 
    c.type === activeTab && 
    (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Répertoire</h2>
          <p className="text-slate-500 text-sm">Gérez vos relations clients et fournisseurs.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold shadow-lg"
        >
          <Plus size={18} /> Ajouter {activeTab === 'customer' ? 'Client' : 'Fournisseur'}
        </button>
      </div>

      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 w-fit">
        <button 
          onClick={() => setActiveTab('customer')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'customer' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Clients
        </button>
        <button 
          onClick={() => setActiveTab('supplier')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'supplier' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Fournisseurs
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder={`Rechercher un ${activeTab === 'customer' ? 'client' : 'fournisseur'}...`} 
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map(contact => (
          <div key={contact.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                {activeTab === 'customer' ? <UserIcon size={24} /> : <Building2 size={24} />}
              </div>
              {contact.balance !== 0 && (
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase ${contact.balance > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {contact.balance > 0 ? 'Dette' : 'Crédit'}
                </span>
              )}
            </div>
            <h4 className="font-bold text-lg text-slate-900 mb-1">{contact.name}</h4>
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
              <Phone size={14} />
              <span>{contact.phone}</span>
            </div>
            <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase">Solde</span>
              <span className={`font-black ${contact.balance > 0 ? 'text-red-500' : contact.balance < 0 ? 'text-emerald-500' : 'text-slate-900'}`}>
                {Math.abs(contact.balance).toLocaleString()} {state.config.currency}
              </span>
            </div>
          </div>
        ))}
        {filteredContacts.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 italic bg-white rounded-2xl border border-dashed border-slate-200">
            Aucun contact trouvé dans cette catégorie.
          </div>
        )}
      </div>

      {showModal && (
        <ContactModal 
          type={activeTab}
          onClose={() => setShowModal(false)}
          onSave={(c) => { onUpdate([...state.contacts, { ...c, id: crypto.randomUUID() }]); setShowModal(false); }}
        />
      )}
    </div>
  );
};

const ContactModal: React.FC<{ type: 'customer' | 'supplier'; onClose: () => void; onSave: (c: Contact) => void }> = ({ type, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    type,
    balance: 0
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold">Ajouter {type === 'customer' ? 'un Client' : 'un Fournisseur'}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">&times;</button>
        </div>
        <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); onSave(formData as Contact); }}>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nom complet / Entreprise</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Téléphone</label>
            <input 
              required
              type="tel" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Solde Initial (Optionnel)</label>
            <input 
              type="number" 
              placeholder="0"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.balance}
              onChange={e => setFormData({ ...formData, balance: Number(e.target.value) })}
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Annuler</button>
            <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Contacts;
