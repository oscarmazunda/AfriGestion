
import React, { useState } from 'react';
import { AppState, BusinessConfig } from '../types';
import { Save, Info, Bell, Database, ShieldCheck } from 'lucide-react';

interface SettingsProps {
  state: AppState;
  onUpdateConfig: (config: BusinessConfig) => void;
}

const Settings: React.FC<SettingsProps> = ({ state, onUpdateConfig }) => {
  const [formData, setFormData] = useState<BusinessConfig>(state.config);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const clearAllData = () => {
    if (confirm("ATTENTION : Cela supprimera TOUTES vos données (Ventes, Stocks, Contacts). Cette action est irréversible. Continuer ?")) {
      localStorage.removeItem('afrigestion_db');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Paramètres du Système</h2>
        <p className="text-slate-500 text-sm">Configurez votre boutique et gérez vos données locales.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <Info size={20} className="text-blue-500" />
            <h3 className="font-bold">Informations de l'entreprise</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nom du Commerce</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dévise (ex: FCFA, GHS, $)</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.currency}
                onChange={e => setFormData({ ...formData, currency: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Téléphone</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Adresse Physique</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Message en-tête des reçus</label>
              <textarea 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-20"
                value={formData.receiptHeader}
                onChange={e => setFormData({ ...formData, receiptHeader: e.target.value })}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-emerald-600" />
            <p className="text-sm font-bold text-emerald-800">
              {saved ? 'Paramètres sauvegardés avec succès !' : 'Pensez à enregistrer vos modifications.'}
            </p>
          </div>
          <button 
            type="submit"
            className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
          >
            <Save size={18} /> Enregistrer
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <Database size={20} className="text-amber-500" />
          <h3 className="font-bold">Maintenance & Sécurité</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-800">Sauvegarde Locale Automatique</h4>
              <p className="text-sm text-slate-500">Toutes les données sont stockées sur cet ordinateur pour un usage hors-ligne.</p>
            </div>
            <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Activé</div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-800">Réinitialisation d'Usine</h4>
              <p className="text-sm text-slate-500 text-red-400">Effacer complètement la base de données locale.</p>
            </div>
            <button 
              onClick={clearAllData}
              className="px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 text-xs font-bold"
            >
              Tout Effacer
            </button>
          </div>
        </div>
      </div>
      
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-2 text-slate-400 text-xs mb-2">
          <ShieldCheck size={14} />
          <span>AfriGestion v1.0.0 - Licence Commerciale Active</span>
        </div>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Conçu pour l'excellence en Afrique</p>
      </div>
    </div>
  );
};

export default Settings;
