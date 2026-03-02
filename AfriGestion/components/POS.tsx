
import React, { useState, useMemo } from 'react';
import { AppState, Product, SaleItem, Sale } from '../types';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Printer, 
  CheckCircle2, 
  Hash, 
  Smartphone, 
  Wallet, 
  CreditCard 
} from 'lucide-react';

interface POSProps {
  state: AppState;
  onSale: (sale: Sale) => void;
}

const POS: React.FC<POSProps> = ({ state, onSale }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<Sale['paymentMethod']>('cash');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return [];
    return state.products.filter(p => 
      p.name.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      (p.reference && p.reference.toLowerCase().includes(term))
    );
  }, [state.products, searchTerm]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert("Ce produit est en rupture de stock !");
      return;
    }
    
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert("Pas assez de stock disponible.");
          return prev;
        }
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        price: product.salePrice,
        total: product.salePrice
      }];
    });
    setSearchTerm('');
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        const product = state.products.find(p => p.id === productId);
        if (delta > 0 && product && newQty > product.stock) {
          alert("Pas assez de stock disponible.");
          return item;
        }
        return { ...item, quantity: newQty, total: newQty * item.price };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const newSale: Sale = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      items: [...cart],
      total: cartTotal,
      paymentMethod,
      userId: state.user?.id || 'unknown'
    };

    onSale(newSale);
    setLastSale(newSale);
    setCart([]);
    setShowReceipt(true);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-2xl font-bold">Caisse / Ventes</h2>
        <div className="bg-emerald-100 text-emerald-800 px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Prêt pour la vente
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Catalog Search Area */}
        <div className="lg:col-span-2 flex flex-col gap-4 no-print overflow-hidden">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher par Nom, Catégorie ou Référence..." 
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm text-lg font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`p-4 bg-white border border-slate-200 rounded-2xl text-left hover:border-emerald-500 hover:shadow-md transition-all active:scale-95 flex flex-col justify-between h-44 group ${product.stock <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase text-slate-400 group-hover:text-emerald-500">{product.category}</span>
                      {product.reference && (
                        <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 flex items-center gap-1">
                          <Hash size={10} /> {product.reference}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-800 line-clamp-2 mt-1 leading-tight">{product.name}</h4>
                  </div>
                  <div className="mt-auto">
                    <p className="text-lg font-black text-emerald-600 leading-none mb-1">
                      {product.salePrice.toLocaleString()} <span className="text-[10px] uppercase">{state.config.currency}</span>
                    </p>
                    <p className={`text-[10px] font-bold uppercase ${product.stock <= product.minStock ? 'text-red-500' : 'text-slate-400'}`}>
                      Stock: {product.stock} {product.unit}
                    </p>
                  </div>
                </button>
              ))}

              {!searchTerm && (
                <div className="col-span-full py-20 text-center text-slate-300">
                  <ShoppingCart size={48} className="mx-auto mb-2 opacity-20" />
                  <p className="font-medium">Tapez pour rechercher des produits</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cart View */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl flex flex-col overflow-hidden no-print">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <ShoppingCart size={20} className="text-slate-400" />
              Panier en cours
            </h3>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
              {cart.length} articles
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                <ShoppingCart size={32} className="mb-4" />
                <p className="text-sm font-medium">Panier vide</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.productId} className="flex gap-3 animate-in fade-in slide-in-from-right-2 duration-200">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm leading-tight mb-1 truncate">{item.name}</p>
                    <p className="text-xs text-emerald-600 font-bold">{item.price.toLocaleString()} {state.config.currency}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center bg-slate-100 rounded-lg p-1">
                      <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:text-emerald-600"><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:text-emerald-600"><Plus size={14} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.productId)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-200">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-xl font-black text-slate-900">
                <span>TOTAL</span>
                <span className="text-emerald-600">{cartTotal.toLocaleString()} {state.config.currency}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
              <button 
                onClick={() => setPaymentMethod('cash')}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-all ${paymentMethod === 'cash' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200'}`}
              >
                <Wallet size={16} />
                <span className="text-[10px] font-bold">ESPECES</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('mobile_money')}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-all ${paymentMethod === 'mobile_money' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200'}`}
              >
                <Smartphone size={16} />
                <span className="text-[10px] font-bold">MOBILE</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('card')}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-all ${paymentMethod === 'card' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200'}`}
              >
                <CreditCard size={16} />
                <span className="text-[10px] font-bold">CARTE</span>
              </button>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg transition-all ${
                cart.length > 0 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-95' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Encaisser & Imprimer
            </button>
          </div>
        </div>
      </div>

      {/* SUCCESS OVERLAY */}
      {showReceipt && lastSale && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center border-b border-slate-100">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold">Vente réussie !</h3>
              <p className="text-slate-500">Choisissez le format d'exportation.</p>
            </div>
            
            <div className="p-8 space-y-4">
              <button 
                onClick={() => window.print()}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800"
              >
                <Printer size={20} /> Imprimer Facture A4 / PDF
              </button>
              
              <button 
                onClick={() => setShowReceipt(false)}
                className="w-full py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50"
              >
                Nouvelle Vente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFESSIONAL A4 INVOICE FOR PRINTING */}
      {lastSale && (
        <div className="print-only">
          <div className="report-header">
             <div>
                <h1 className="text-4xl font-black text-emerald-600 uppercase mb-1">{state.config.name}</h1>
                <p className="text-slate-500 text-sm font-medium">{state.config.address} • {state.config.phone}</p>
             </div>
             <div className="text-right">
                <div className="bg-slate-900 text-white px-4 py-2 rounded-lg font-black text-sm uppercase mb-1">FACTURE OFFICIELLE</div>
                <p className="text-xs font-bold text-slate-400">#INV-{lastSale.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-slate-400">{new Date(lastSale.date).toLocaleString('fr-FR')}</p>
             </div>
          </div>

          <div className="report-card !p-0 overflow-hidden mb-8">
            <table className="table-professional">
              <thead>
                <tr>
                  <th className="!bg-slate-800">Description</th>
                  <th className="!bg-slate-800 text-center">Qté</th>
                  <th className="!bg-slate-800 text-right">Prix Unitaire</th>
                  <th className="!bg-slate-800 text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {lastSale.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="font-bold">{item.name}</td>
                    <td className="text-center font-medium">{item.quantity}</td>
                    <td className="text-right">{item.price.toLocaleString()}</td>
                    <td className="text-right font-black">{item.total.toLocaleString()} {state.config.currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between">
            <div className="text-xs text-slate-400 max-w-sm italic">
               <h4 className="font-bold text-slate-700 not-italic uppercase mb-2">Conditions :</h4>
               <p>{state.config.receiptHeader}</p>
               <p className="mt-4">Paiement effectué par : <span className="font-bold uppercase text-slate-900">{lastSale.paymentMethod.replace('_', ' ')}</span></p>
            </div>
            <div className="invoice-total-box">
               <p className="text-[10px] font-black uppercase text-white/70 mb-1">Net à Payer</p>
               <p className="text-3xl font-black">{lastSale.total.toLocaleString()} <span className="text-sm font-normal">{state.config.currency}</span></p>
            </div>
          </div>

          <div className="mt-32 flex justify-between items-center text-[10px] text-slate-400 uppercase font-black">
             <div>Généré via AfriGestion Pro • Logiciel de Gestion Offline</div>
             <div className="text-center border-t border-slate-300 pt-2 w-64 text-slate-900">Cachet Commercial</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
