
import React, { useState, useMemo } from 'react';
import { AppState, Expense, Revenue } from '../types';
import { 
  Plus, 
  Search, 
  DollarSign, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Filter, 
  Calendar,
  X,
  RefreshCcw,
  FileDown
} from 'lucide-react';

interface AccountingProps {
  state: AppState;
  onAddExpense: (expense: Expense) => void;
  onAddRevenue: (revenue: Revenue) => void;
}

const Accounting: React.FC<AccountingProps> = ({ state, onAddExpense, onAddRevenue }) => {
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  
  // Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'manual'>('all');

  const { sales, expenses, revenues, config } = state;

  // Filtering Logic
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const dateMatch = (!startDate || s.date >= startDate) && (!endDate || s.date <= endDate + 'T23:59:59');
      const searchMatch = !searchTerm || s.id.toLowerCase().includes(searchTerm.toLowerCase());
      const typeMatch = filterType === 'all' || filterType === 'sale';
      return dateMatch && searchMatch && typeMatch;
    });
  }, [sales, startDate, endDate, searchTerm, filterType]);

  const filteredRevenues = useMemo(() => {
    return (revenues || []).filter(r => {
      const dateMatch = (!startDate || r.date >= startDate) && (!endDate || r.date <= endDate + 'T23:59:59');
      const searchMatch = !searchTerm || r.description.toLowerCase().includes(searchTerm.toLowerCase());
      const typeMatch = filterType === 'all' || filterType === 'manual';
      return dateMatch && searchMatch && typeMatch;
    });
  }, [revenues, startDate, endDate, searchTerm, filterType]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const dateMatch = (!startDate || e.date >= startDate) && (!endDate || e.date <= endDate + 'T23:59:59');
      const searchMatch = !searchTerm || e.description.toLowerCase().includes(searchTerm.toLowerCase()) || e.category.toLowerCase().includes(searchTerm.toLowerCase());
      return dateMatch && searchMatch;
    });
  }, [expenses, startDate, endDate, searchTerm]);

  // Combined journals for PDF
  const combinedEntries = useMemo(() => {
     const entries = [
        ...filteredRevenues.map(r => ({ ...r, entryType: 'REVENUE', typeLabel: 'EXTRA' })),
        ...filteredSales.map(s => ({ ...s, entryType: 'REVENUE', typeLabel: 'VENTE', description: `Ticket #${s.id.slice(0, 6)}`, amount: s.total })),
        ...filteredExpenses.map(e => ({ ...e, entryType: 'EXPENSE', typeLabel: 'DEPENSE', amount: e.amount }))
     ];
     return entries.sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredRevenues, filteredSales, filteredExpenses]);

  // Derived Stats
  const salesRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const manualRevenue = filteredRevenues.reduce((sum, r) => sum + r.amount, 0);
  const totalRevenue = salesRevenue + manualRevenue;
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  const cogs = filteredSales.reduce((sum, s) => {
    return sum + s.items.reduce((itemSum, item) => {
      const prod = state.products.find(p => p.id === item.productId);
      return itemSum + (item.quantity * (prod?.purchasePrice || 0));
    }, 0);
  }, 0);

  const netProfit = totalRevenue - cogs - totalExpenses;

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setFilterType('all');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold">Comptabilité & Finances</h2>
          <p className="text-slate-500 text-sm">Gérez vos recettes et vos dépenses avec filtres avancés.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-bold border border-slate-200 transition-all"
          >
            <FileDown size={18} /> Imprimer PDF
          </button>
          <button 
            onClick={() => setShowRevenueModal(true)}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-200 transition-all"
          >
            <Plus size={18} /> Nouvelle Recette
          </button>
          <button 
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold shadow-lg shadow-slate-200 transition-all"
          >
            <Plus size={18} /> Nouvelle Dépense
          </button>
        </div>
      </div>

      {/* Filter Bar (No Print) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 no-print">
        <div className="flex items-center gap-2 mb-2">
          <Filter size={18} className="text-slate-400" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Filtres de recherche</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Du (Date)</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                type="date" 
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Au (Date)</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                type="date" 
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Type Recette</label>
            <select 
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
            >
              <option value="all">Tous les types</option>
              <option value="sale">Ventes Boutique</option>
              <option value="manual">Recettes Manuelles</option>
            </select>
          </div>
          <div className="space-y-1 lg:col-span-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Recherche</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                type="text" 
                placeholder="Description..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-end">
            <button 
              onClick={resetFilters}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
            >
              <RefreshCcw size={14} /> Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <ArrowUpCircle size={20} />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recettes Filtrées</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalRevenue.toLocaleString()} <span className="text-sm font-medium">{config.currency}</span></p>
          <div className="flex flex-col mt-2 space-y-1">
             <p className="text-[10px] text-slate-400 font-bold uppercase flex justify-between">Ventes: <span>{salesRevenue.toLocaleString()}</span></p>
             <p className="text-[10px] text-slate-400 font-bold uppercase flex justify-between">Extra: <span>{manualRevenue.toLocaleString()}</span></p>
          </div>
          <div className="absolute top-0 right-0 w-1 bg-emerald-500 h-full group-hover:w-2 transition-all"></div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <ArrowDownCircle size={20} />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dépenses Filtrées</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalExpenses.toLocaleString()} <span className="text-sm font-medium">{config.currency}</span></p>
          <p className="text-xs text-slate-400 mt-2">Basé sur vos critères de recherche</p>
          <div className="absolute top-0 right-0 w-1 bg-red-500 h-full group-hover:w-2 transition-all"></div>
        </div>

        <div className={`p-6 rounded-2xl shadow-xl transition-all relative overflow-hidden group ${netProfit >= 0 ? 'bg-emerald-600 shadow-emerald-200 text-white' : 'bg-red-600 shadow-red-200 text-white'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 text-white rounded-lg">
              <DollarSign size={20} />
            </div>
            <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Bénéfice Net Période</span>
          </div>
          <p className="text-2xl font-black">{netProfit.toLocaleString()} <span className="text-sm font-medium">{config.currency}</span></p>
          <p className="text-xs text-white/70 mt-2">Revenu - COGS - Dépenses</p>
          <div className="absolute top-0 right-0 w-1 bg-white/40 h-full group-hover:w-2 transition-all"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
        {/* Income Journal */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2 text-slate-700">
              <ArrowUpCircle size={18} className="text-emerald-500" />
              Journal des Recettes
            </h3>
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
              {filteredSales.length + filteredRevenues.length} entrées
            </span>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white shadow-sm text-[10px] uppercase font-bold text-slate-400 z-10">
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4">Date / Heure</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Détails</th>
                  <th className="px-6 py-4 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {combinedEntries.filter(e => e.entryType === 'REVENUE').map((entry: any) => (
                  <tr key={entry.id} className="text-sm hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                        <div className="font-medium text-slate-700">{new Date(entry.date).toLocaleDateString('fr-FR')}</div>
                        <div className="text-[10px] text-slate-400">{new Date(entry.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${entry.typeLabel === 'EXTRA' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {entry.typeLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600 truncate max-w-[150px]">{entry.description}</td>
                    <td className="px-6 py-4 text-right font-black text-emerald-600">+{entry.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses Journal */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2 text-slate-700">
              <ArrowDownCircle size={18} className="text-red-500" />
              Journal des Dépenses
            </h3>
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
              {filteredExpenses.length} entrées
            </span>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-white shadow-sm text-[10px] uppercase font-bold text-slate-400 z-10">
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4">Date / Heure</th>
                  <th className="px-6 py-4">Catégorie</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                        <div className="font-medium text-slate-700">{new Date(exp.date).toLocaleDateString('fr-FR')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase">{exp.category}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">{exp.description}</td>
                    <td className="px-6 py-4 text-right font-black text-red-600">-{exp.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PROFRESSIONAL PRINT VIEW FOR ACCOUNTING */}
      <div className="print-only">
        <div className="report-header flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-emerald-600 uppercase mb-1">{state.config.name}</h1>
            <p className="text-slate-500 text-sm font-medium">{state.config.address} • {state.config.phone}</p>
          </div>
          <div className="text-right">
            <div className="bg-slate-900 text-white px-4 py-2 rounded-lg font-black text-sm uppercase mb-1">État Financier</div>
            <p className="text-xs font-bold text-slate-400">Période: {startDate || 'Début'} au {endDate || 'Aujourd\'hui'}</p>
          </div>
        </div>

        <div className="report-card border-l-4 border-l-slate-900 grid grid-cols-4 gap-4 bg-slate-50">
            <div className="text-center border-r border-slate-200">
                <p className="text-[8px] font-black uppercase text-slate-400">Total Recettes</p>
                <p className="text-xl font-black">{totalRevenue.toLocaleString()} <span className="text-[10px] font-normal">{config.currency}</span></p>
            </div>
            <div className="text-center border-r border-slate-200">
                <p className="text-[8px] font-black uppercase text-slate-400">Total Dépenses</p>
                <p className="text-xl font-black text-red-600">{totalExpenses.toLocaleString()} <span className="text-[10px] font-normal">{config.currency}</span></p>
            </div>
            <div className="text-center border-r border-slate-200">
                <p className="text-[8px] font-black uppercase text-slate-400">COGS (Stock)</p>
                <p className="text-xl font-black text-amber-600">{cogs.toLocaleString()} <span className="text-[10px] font-normal">{config.currency}</span></p>
            </div>
            <div className="text-center">
                <p className="text-[8px] font-black uppercase text-slate-400">Bénéfice Net</p>
                <p className="text-xl font-black text-emerald-600">{netProfit.toLocaleString()} <span className="text-[10px] font-normal">{config.currency}</span></p>
            </div>
        </div>

        <div className="report-card !p-0 overflow-hidden">
            <div className="p-3 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="text-xs font-black uppercase">Grand Livre des Opérations</h3>
                <span className="text-[10px] font-bold">{combinedEntries.length} Opérations enregistrées</span>
            </div>
            <table className="table-professional">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Détails / Catégorie</th>
                        <th className="text-right">Montant</th>
                    </tr>
                </thead>
                <tbody>
                    {combinedEntries.map((entry: any) => (
                        <tr key={entry.id}>
                            <td className="font-medium whitespace-nowrap">{new Date(entry.date).toLocaleDateString('fr-FR')}</td>
                            <td>
                                <span className={`badge-print ${
                                    entry.entryType === 'REVENUE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {entry.typeLabel}
                                </span>
                            </td>
                            <td className="font-medium">
                                {entry.description}
                                {entry.category && <span className="text-slate-400 text-[10px] ml-2 font-normal">[{entry.category}]</span>}
                            </td>
                            <td className={`text-right font-black ${entry.entryType === 'REVENUE' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {entry.entryType === 'REVENUE' ? '+' : '-'}{entry.amount.toLocaleString()} {config.currency}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="mt-20 flex justify-between items-center text-[10px] text-slate-400 uppercase font-black">
          <div>Généré via AfriGestion • Confidentialité Assurée</div>
          <div className="flex gap-12">
            <div className="text-center border-t border-slate-300 pt-2 w-48">Signature Comptable</div>
            <div className="text-center border-t border-slate-300 pt-2 w-48">Approbation Direction</div>
          </div>
        </div>
      </div>

      {showExpenseModal && (
        <AccountingEntryModal 
          title="Nouvelle Dépense"
          color="slate"
          onClose={() => setShowExpenseModal(false)}
          onSave={(e) => { onAddExpense({ ...e, id: crypto.randomUUID() } as Expense); setShowExpenseModal(false); }}
        />
      )}

      {showRevenueModal && (
        <AccountingEntryModal 
          title="Nouvelle Recette"
          color="emerald"
          onClose={() => setShowRevenueModal(false)}
          onSave={(r) => { onAddRevenue({ ...r, id: crypto.randomUUID() } as Revenue); setShowRevenueModal(false); }}
        />
      )}
    </div>
  );
};

// ... AccountingEntryModal remains same ...
interface ModalProps {
    title: string;
    color: 'emerald' | 'slate';
    onClose: () => void;
    onSave: (data: any) => void;
}

const AccountingEntryModal: React.FC<ModalProps> = ({ title, color, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    category: 'Général',
    date: new Date().toISOString().split('T')[0]
  });

  const btnColorClass = color === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 text-2xl transition-transform hover:rotate-90">
            <X size={24} />
          </button>
        </div>
        <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Description</label>
            <input 
              required
              type="text" 
              placeholder="ex: Versement fond de roulement, Autre service..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Montant</label>
            <input 
              required
              type="number" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Date</label>
            <input 
              required
              type="date" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">Annuler</button>
            <button type="submit" className={`flex-1 py-4 ${btnColorClass} text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95`}>Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Accounting;