
import React, { useState } from 'react';
import { AppState, Product } from '../types';
import { Plus, Search, Edit2, Trash2, Package, Filter, Download, Hash, FileDown } from 'lucide-react';
import { exportToCSV } from '../store';

interface StockProps {
  state: AppState;
  onUpdate: (products: Product[]) => void;
}

const Stock: React.FC<StockProps> = ({ state, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = state.products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.reference && p.reference.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = (id: string) => {
    if (confirm("Supprimer ce produit ? Cette action est irréversible.")) {
      onUpdate(state.products.filter(p => p.id !== id));
    }
  };

  const handleExportCSV = () => {
    exportToCSV(state.products, `stock_${new Date().toISOString().split('T')[0]}`);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Stocks</h2>
          <p className="text-slate-500 text-sm">Contrôlez vos articles et surveillez les alertes de rupture.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handlePrintPDF}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 font-bold transition-all"
          >
            <FileDown size={18} /> PDF
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 font-bold transition-all"
          >
            <Download size={18} /> CSV
          </button>
          <button 
            onClick={() => { setEditingProduct(null); setShowModal(true); }}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-200 transition-all"
          >
            <Plus size={18} /> Nouvel Article
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden no-print">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher par Nom, Catégorie ou Référence..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Réf</th>
                <th className="px-6 py-4">Nom du produit</th>
                <th className="px-6 py-4 text-right">P.Vente</th>
                <th className="px-6 py-4 text-center">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">{product.reference || '--'}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {product.name}
                    <div className="text-[10px] text-slate-400 font-medium">{product.category}</div>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-emerald-600">{product.salePrice.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-black ${product.stock <= product.minStock ? 'text-red-600' : 'text-slate-900'}`}>{product.stock}</span>
                    <span className="text-[10px] ml-1 text-slate-400 uppercase font-bold">{product.unit}</span>
                  </td>
                  <td className="px-6 py-4">
                    {product.stock <= 0 ? (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-[10px] font-bold uppercase">Rupture</span>
                    ) : product.stock <= product.minStock ? (
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold uppercase">Critique</span>
                    ) : (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold uppercase">OK</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setEditingProduct(product); setShowModal(true); }}
                        className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROFESSIONAL PRINT VIEW FOR STOCK */}
      <div className="print-only">
        <div className="report-header flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-emerald-600 uppercase mb-1">{state.config.name}</h1>
            <p className="text-slate-500 text-sm font-medium">Inventaire Officiel des Stocks</p>
          </div>
          <div className="text-right">
            <div className="bg-slate-900 text-white px-4 py-2 rounded-lg font-black text-sm uppercase mb-1">Rapport de Stock</div>
            <p className="text-xs font-bold text-slate-400">Généré le: {new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
           <div className="report-card !mb-0 text-center">
              <p className="text-[8px] font-black uppercase text-slate-400">Total Références</p>
              <p className="text-xl font-black">{state.products.length}</p>
           </div>
           <div className="report-card !mb-0 text-center">
              <p className="text-[8px] font-black uppercase text-slate-400">Quantité Totale</p>
              <p className="text-xl font-black text-blue-600">{state.products.reduce((acc, p) => acc + p.stock, 0)}</p>
           </div>
           <div className="report-card !mb-0 text-center">
              <p className="text-[8px] font-black uppercase text-slate-400">Valeur Vente</p>
              <p className="text-xl font-black text-emerald-600">{state.products.reduce((acc, p) => acc + (p.stock * p.salePrice), 0).toLocaleString()} <span className="text-[10px] font-normal">{state.config.currency}</span></p>
           </div>
           <div className="report-card !mb-0 text-center border-l-4 border-l-red-500">
              <p className="text-[8px] font-black uppercase text-slate-400">Ruptures</p>
              <p className="text-xl font-black text-red-600">{state.products.filter(p => p.stock <= p.minStock).length}</p>
           </div>
        </div>

        <div className="report-card !p-0 overflow-hidden">
           <table className="table-professional">
              <thead>
                <tr>
                  <th>Réf</th>
                  <th>Désignation</th>
                  <th>Catégorie</th>
                  <th className="text-right">Prix Vente</th>
                  <th className="text-center">Quantité</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr key={p.id}>
                    <td className="font-mono text-slate-400">{p.reference || '-'}</td>
                    <td className="font-bold">{p.name}</td>
                    <td>{p.category}</td>
                    <td className="text-right font-medium">{p.salePrice.toLocaleString()} {state.config.currency}</td>
                    <td className="text-center font-black">
                      <span className={p.stock <= p.minStock ? 'text-red-600' : ''}>{p.stock}</span> {p.unit}
                    </td>
                    <td className="text-right">
                       <span className={`badge-print ${
                         p.stock <= 0 ? 'bg-red-100 text-red-700' : p.stock <= p.minStock ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                       }`}>
                         {p.stock <= 0 ? 'RUPTURE' : p.stock <= p.minStock ? 'BAS' : 'OK'}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>

        <div className="mt-20 flex justify-between items-center text-[10px] text-slate-400 uppercase font-black">
          <div>Certifié par AfriGestion Pro • Version 1.0</div>
          <div className="text-center border-t border-slate-300 pt-2 w-64 uppercase text-slate-900">Visa de l'Inventaire</div>
        </div>
      </div>

      {showModal && (
        <ProductModal 
          product={editingProduct} 
          onClose={() => setShowModal(false)}
          onSave={(p) => {
            if (editingProduct) {
              onUpdate(state.products.map(old => old.id === p.id ? p : old));
            } else {
              onUpdate([...state.products, { ...p, id: crypto.randomUUID() }]);
            }
            setShowModal(false);
          }}
          categories={[...new Set(state.products.map(p => p.category))]}
        />
      )}
    </div>
  );
};

// ... ProductModal remains same ...
const ProductModal: React.FC<{ 
  product: Product | null; 
  onClose: () => void; 
  onSave: (p: Product) => void;
  categories: string[];
}> = ({ product, onClose, onSave, categories }) => {
  const [formData, setFormData] = useState<Partial<Product>>(product || {
    reference: '',
    name: '',
    category: '',
    purchasePrice: 0,
    salePrice: 0,
    stock: 0,
    minStock: 5,
    unit: 'pcs'
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold">{product ? 'Modifier l\'article' : 'Ajouter un article'}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>
        <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); onSave(formData as Product); }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Hash size={12} /> Référence / Code
              </label>
              <input 
                type="text" 
                placeholder="Ex: REF001 ou Code-barres"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.reference}
                onChange={e => setFormData({ ...formData, reference: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Catégorie</label>
              <input 
                list="categories"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              />
              <datalist id="categories">
                {categories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nom de l'article</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Unité (Kg, Pcs, etc.)</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Prix d'Achat</label>
              <input 
                required
                type="number" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.purchasePrice}
                onChange={e => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Prix de Vente</label>
              <input 
                required
                type="number" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.salePrice}
                onChange={e => setFormData({ ...formData, salePrice: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Stock Actuel</label>
              <input 
                required
                type="number" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Seuil d'Alerte Stock Faible</label>
              <input 
                required
                type="number" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.minStock}
                onChange={e => setFormData({ ...formData, minStock: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">Annuler</button>
            <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Stock;