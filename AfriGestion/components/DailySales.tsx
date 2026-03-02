
import React, { useState } from 'react';
import { AppState, Sale } from '../types';
import { Printer, Calendar, Wallet, Smartphone, CreditCard, ChevronLeft, ChevronRight, FileDown } from 'lucide-react';

interface DailySalesProps {
  state: AppState;
}

const DailySales: React.FC<DailySalesProps> = ({ state }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const dailySales = state.sales.filter(s => s.date.startsWith(selectedDate));
  
  const totals = dailySales.reduce((acc, sale) => {
    acc.total += sale.total;
    if (sale.paymentMethod === 'cash') acc.cash += sale.total;
    if (sale.paymentMethod === 'mobile_money') acc.mobile += sale.total;
    if (sale.paymentMethod === 'card') acc.card += sale.total;
    return acc;
  }, { total: 0, cash: 0, mobile: 0, card: 0 });

  const handlePrint = () => {
    window.print();
  };

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold">Ventes Journalières</h2>
          <p className="text-slate-500 text-sm">Rapport complet des ventes pour une journée spécifique.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <button onClick={() => changeDate(-1)} className="p-2 hover:bg-slate-50 text-slate-500 border-r border-slate-200">
              <ChevronLeft size={20} />
            </button>
            <div className="relative flex items-center px-4 py-2 gap-2">
              <Calendar size={18} className="text-emerald-500" />
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="font-bold outline-none text-sm"
              />
            </div>
            <button onClick={() => changeDate(1)} className="p-2 hover:bg-slate-50 text-slate-500 border-l border-slate-200">
              <ChevronRight size={20} />
            </button>
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            <FileDown size={18} /> Exporter PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Ventes</p>
          <p className="text-2xl font-black text-slate-900">{totals.total.toLocaleString()} <span className="text-xs">{state.config.currency}</span></p>
          <div className="mt-2 text-xs text-emerald-600 font-bold">{dailySales.length} Transactions</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><Wallet size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Espèces</p>
            <p className="text-lg font-bold">{totals.cash.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Smartphone size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile Money</p>
            <p className="text-lg font-bold">{totals.mobile.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><CreditCard size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Carte</p>
            <p className="text-lg font-bold">{totals.card.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Transactions Table UI */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden no-print">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-700">Détails des transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                <th className="px-6 py-4">Heure</th>
                <th className="px-6 py-4">Référence</th>
                <th className="px-6 py-4">Articles</th>
                <th className="px-6 py-4">Paiement</th>
                <th className="px-6 py-4 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {dailySales.length > 0 ? (
                dailySales.map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{new Date(sale.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-6 py-4 font-mono font-bold text-xs">#{sale.id.slice(0, 8)}</td>
                    <td className="px-6 py-4">
                      {sale.items.length} {sale.items.length > 1 ? 'articles' : 'article'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                        sale.paymentMethod === 'cash' ? 'bg-amber-100 text-amber-700' :
                        sale.paymentMethod === 'mobile_money' ? 'bg-blue-100 text-blue-700' :
                        'bg-indigo-100 text-indigo-700'
                      }`}>
                        {sale.paymentMethod.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900">{sale.total.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    Aucune vente enregistrée pour cette journée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROFRESSIONAL PDF VIEW */}
      <div className="print-only">
        <div className="report-header flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-emerald-600 uppercase mb-1">{state.config.name}</h1>
            <p className="text-slate-500 text-sm font-medium">{state.config.address} • {state.config.phone}</p>
          </div>
          <div className="text-right">
            <div className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-black text-sm uppercase mb-1">Rapport de Ventes</div>
            <p className="text-xs font-bold text-slate-400">{new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="report-card !mb-0 border-l-4 border-l-emerald-500 bg-emerald-50/30">
            <p className="text-[10px] font-black text-emerald-700 uppercase mb-1">Recette Totale</p>
            <p className="text-2xl font-black text-slate-900">{totals.total.toLocaleString()} <span className="text-xs font-normal">{state.config.currency}</span></p>
          </div>
          <div className="report-card !mb-0 border-l-4 border-l-amber-500 bg-amber-50/30">
            <p className="text-[10px] font-black text-amber-700 uppercase mb-1">Total Espèces</p>
            <p className="text-2xl font-black text-slate-900">{totals.cash.toLocaleString()} <span className="text-xs font-normal">{state.config.currency}</span></p>
          </div>
          <div className="report-card !mb-0 border-l-4 border-l-blue-500 bg-blue-50/30">
            <p className="text-[10px] font-black text-blue-700 uppercase mb-1">Volume Mobile</p>
            <p className="text-2xl font-black text-slate-900">{totals.mobile.toLocaleString()} <span className="text-xs font-normal">{state.config.currency}</span></p>
          </div>
        </div>

        <div className="report-card !p-0 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-xs font-black text-slate-700 uppercase">Journal des transactions détaillées</h3>
          </div>
          <table className="table-professional">
            <thead>
              <tr>
                <th>Heure</th>
                <th>Référence</th>
                <th>Articles</th>
                <th>Paiement</th>
                <th className="text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {dailySales.map(sale => (
                <tr key={sale.id}>
                  <td className="font-medium">{new Date(sale.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="font-mono font-bold text-slate-400 text-[10px]">#{sale.id.slice(0, 8).toUpperCase()}</td>
                  <td>{sale.items.length} art. ({sale.items.map(i => i.name).join(', ').slice(0, 30)}...)</td>
                  <td>
                    <span className={`badge-print ${
                      sale.paymentMethod === 'cash' ? 'bg-amber-100 text-amber-700' :
                      sale.paymentMethod === 'mobile_money' ? 'bg-blue-100 text-blue-700' :
                      'bg-indigo-100 text-indigo-700'
                    }`}>
                      {sale.paymentMethod.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="text-right font-black">{sale.total.toLocaleString()} {state.config.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 flex justify-between items-center text-[10px] text-slate-400 uppercase font-black">
          <div>Généré le {new Date().toLocaleString()} par AfriGestion Pro</div>
          <div className="text-right border-t border-slate-300 pt-4 w-64">
            <p className="text-slate-900 mb-8">Cachet et Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySales;