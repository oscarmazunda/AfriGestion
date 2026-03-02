
import React, { useState, useEffect, useCallback } from 'react';
import { AppView, AppState, User, Product, Sale, Expense, Contact, Revenue } from './types';
import { loadData, saveData } from './store';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Stock from './components/Stock';
import Contacts from './components/Contacts';
import Accounting from './components/Accounting';
import Settings from './components/Settings';
import Auth from './components/Auth';
import DailySales from './components/DailySales';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadData());

  useEffect(() => {
    // Check for auto-login if session was active (simplified for demo)
    const stored = loadData();
    setState(prev => ({ ...prev, ...stored }));
  }, []);

  const setView = (view: AppView) => {
    setState(prev => ({ ...prev, view }));
  };

  const handleLogin = (user: User) => {
    setState(prev => ({ ...prev, user, view: AppView.DASHBOARD }));
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, user: null, view: AppView.AUTH }));
  };

  const updateProducts = (products: Product[]) => {
    setState(prev => {
      const newState = { ...prev, products };
      saveData(newState);
      return newState;
    });
  };

  const addSale = (sale: Sale) => {
    setState(prev => {
      // Update stock levels automatically
      const updatedProducts = prev.products.map(p => {
        const saleItem = sale.items.find(item => item.productId === p.id);
        if (saleItem) {
          return { ...p, stock: p.stock - saleItem.quantity };
        }
        return p;
      });

      const newState = { 
        ...prev, 
        sales: [sale, ...prev.sales],
        products: updatedProducts
      };
      saveData(newState);
      return newState;
    });
  };

  const addExpense = (expense: Expense) => {
    setState(prev => {
      const newState = { ...prev, expenses: [expense, ...prev.expenses] };
      saveData(newState);
      return newState;
    });
  };

  const addRevenue = (revenue: Revenue) => {
    setState(prev => {
      const newState = { ...prev, revenues: [revenue, ...prev.revenues] };
      saveData(newState);
      return newState;
    });
  };

  const updateContacts = (contacts: Contact[]) => {
    setState(prev => {
      const newState = { ...prev, contacts };
      saveData(newState);
      return newState;
    });
  };

  const updateConfig = (config: any) => {
    setState(prev => {
      const newState = { ...prev, config };
      saveData(newState);
      return newState;
    });
  };

  if (!state.user && state.view === AppView.AUTH) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (state.view) {
      case AppView.DASHBOARD:
        return <Dashboard state={state} />;
      case AppView.POS:
        return <POS state={state} onSale={addSale} />;
      case AppView.DAILY_SALES:
        return <DailySales state={state} />;
      case AppView.STOCK:
        return <Stock state={state} onUpdate={updateProducts} />;
      case AppView.CONTACTS:
        return <Contacts state={state} onUpdate={updateContacts} />;
      case AppView.ACCOUNTING:
        return <Accounting state={state} onAddExpense={addExpense} onAddRevenue={addRevenue} />;
      case AppView.SETTINGS:
        return <Settings state={state} onUpdateConfig={updateConfig} />;
      default:
        return <Dashboard state={state} />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar 
        currentView={state.view} 
        setView={setView} 
        onLogout={handleLogout} 
        user={state.user} 
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
