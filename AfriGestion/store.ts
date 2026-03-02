
import { AppState, AppView, Product, Sale, Expense, Contact, BusinessConfig, User, Revenue } from './types';

const STORAGE_KEY = 'afrigestion_db';

const DEFAULT_CONFIG: BusinessConfig = {
  name: 'Mon Commerce',
  address: 'Abidjan, Côte d\'Ivoire',
  phone: '+225 00 00 00 00',
  currency: 'FCFA',
  receiptHeader: 'Merci de votre visite !'
};

const INITIAL_STATE: AppState = {
  view: AppView.AUTH,
  user: null,
  products: [],
  sales: [],
  expenses: [],
  revenues: [],
  contacts: [],
  config: DEFAULT_CONFIG
};

export const loadData = (): AppState => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return INITIAL_STATE;
  try {
    const parsed = JSON.parse(data);
    return { ...INITIAL_STATE, ...parsed, view: AppView.AUTH }; // Force auth on reload
  } catch (e) {
    return INITIAL_STATE;
  }
};

export const saveData = (state: Partial<AppState>) => {
  const current = loadData();
  const newState = { ...current, ...state };
  // We don't want to save the transient view state or current logged user session for security
  const { view, user, ...toSave } = newState;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
};

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
  const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
