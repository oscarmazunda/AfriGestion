
import React from 'react';
import { AppState } from '../types';
import { 
  TrendingUp, 
  AlertTriangle, 
  ShoppingCart, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const { products, sales, expenses, config } = state;

  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => s.date.startsWith(today));
  const totalTodaySales = todaySales.reduce((sum, s) => sum + s.total, 0);

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  
  // Calculate revenue per day for chart
  const salesByDate = sales.reduce((acc: any, sale) => {
    const date = sale.date.split('T')[0];
    acc[date] = (acc[date] || 0) + sale.total;
    return acc;
  }, {});

  const chartData = Object.entries(salesByDate).map(([date, total]) => ({ date, total })).slice(-7);

  const stats = [
    { 
      label: "Ventes d'aujourd'hui", 
      value: `${totalTodaySales.toLocaleString()} ${config.currency}`, 
      icon: TrendingUp, 
      color: "bg-emerald-500" 
    },
    { 
      label: "Commandes totales", 
      value: sales.length, 
      icon: ShoppingCart, 
      color: "bg-blue-500" 
    },
    { 
      label: "Articles en stock", 
      value: products.reduce((sum, p) => sum + p.stock, 0), 
      icon: Package, 
      color: "bg-indigo-500" 
    },
    { 
      label: "Alertes stock", 
      value: lowStockProducts.length, 
      icon: AlertTriangle, 
      color: lowStockProducts.length > 0 ? "bg-red-500" : "bg-emerald-500" 
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Bienvenue, {state.user?.username}</h2>
        <p className="text-slate-500 text-sm">Voici un aperçu de votre activité commerciale aujourd'hui.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`${stat.color} p-3 rounded-xl text-white`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-500" />
            Évolution des ventes (7 derniers jours)
          </h3>
          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" fontSize={12} tickMargin={10} />
                  <YAxis fontSize={12} tickFormatter={(val) => `${val}`} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                Pas assez de données pour afficher le graphique.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-500" />
            Alertes Stock Faible
          </h3>
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{p.name}</p>
                    <p className="text-xs text-red-600">Seuil: {p.minStock} {p.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-red-600">{p.stock}</p>
                    <p className="text-[10px] text-red-400 font-bold uppercase">{p.unit}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">
                Aucune alerte de stock en cours.
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold mb-4">Ventes Récentes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-3 text-xs font-bold text-slate-500 uppercase">ID</th>
                <th className="py-3 text-xs font-bold text-slate-500 uppercase">Date</th>
                <th className="py-3 text-xs font-bold text-slate-500 uppercase">Articles</th>
                <th className="py-3 text-xs font-bold text-slate-500 uppercase text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sales.slice(0, 5).map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 text-xs font-mono text-slate-400">#{sale.id.slice(0, 8)}</td>
                  <td className="py-4 text-sm">{new Date(sale.date).toLocaleString('fr-FR')}</td>
                  <td className="py-4 text-sm">{sale.items.length} items</td>
                  <td className="py-4 text-sm font-bold text-right">{sale.total.toLocaleString()} {config.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
